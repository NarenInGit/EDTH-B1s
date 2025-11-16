from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
from datetime import datetime, timezone
import math
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CAPTURE_DIR = (Path(__file__).resolve().parent / "captures")
CAPTURE_DIR.mkdir(exist_ok=True)
app.mount("/captures", StaticFiles(directory=CAPTURE_DIR), name="captures")

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials missing. Check Backend/.env.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
}


@app.post("/capture")
async def capture_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    suffix = Path(file.filename).suffix if file.filename else ".png"
    if suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"}:
        suffix = ".png"

    filename = f"capture_{uuid4().hex}{suffix}"
    file_path = CAPTURE_DIR / filename
    contents = await file.read()
    file_path.write_bytes(contents)

    return {"status": "ok", "filename": filename, "url": f"/captures/{filename}"}


class ReportIn(BaseModel):
    timestamp: int
    type: str
    lat: float
    lon: float
    direction: str
    description: str

def supabase_timestamp():
    """Return an ISO8601 string compatible with Supabase timestamp column."""
    return datetime.now(timezone.utc).isoformat()

@app.post("/report")
def create_report(report: ReportIn):
    data = {
        "timestamp": report.timestamp,
        "type": report.type,
        "lat": report.lat,
        "lon": report.lon,
        "direction": report.direction,
        "description": report.description,
        "validated": False,
        "created_at": supabase_timestamp(),
    }

    try:
        supabase.table("reports").insert(data).execute()
        return {"status": "ok"}
    except Exception as e:
        print("Supabase insert error:", e)
        return {"status": "error", "detail": str(e)}

directionVectors = {
    "N":  (0, 1),
    "NE": (1, 1),
    "E":  (1, 0),
    "SE": (1, -1),
    "S":  (0, -1),
    "SW": (-1, -1),
    "W":  (-1, 0),
    "NW": (-1, 1)
}


# 1. LOAD + CLEAN DATA
def loadData():
    df = pd.read_csv("flightpaths.csv")
    df["timestampDt"] = pd.to_datetime(df["timestamp"], unit="ms")
    return df

def loadFromSupabase():
    res = supabase.table("reports").select("*").execute()
    rows = res.data  # list of dicts
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["timestampDt"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
    return df

# 2. SEVERITY SCORE
def applySeverity(df):
    if df.empty:
        df["severity"] = []
        return df
    if "timestampDt" not in df.columns:
        df["timestampDt"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
    now = df["timestampDt"].max()

    def severity(row):
        ageMinutes = (now - row["timestampDt"]).total_seconds() / 60.0

        if ageMinutes < 10:
            timeFactor = 1.0
        elif ageMinutes < 30:
            timeFactor = 0.7
        elif ageMinutes < 60:
            timeFactor = 0.5
        else:
            timeFactor = 0.3

        typeWeights = {
            "explosion": 1.0,
            "drone": 0.90,
            "troop": 0.80,
            "other": 0.60
        }

        typeFactor = typeWeights.get(str(row["type"]).lower(), 0.5)
        return timeFactor * typeFactor

    df["severity"] = df.apply(severity, axis=1)
    return df


# 3. SCALE GEO COORDINATES
def scaleCoords(df):
    coords = df[["lat", "lon"]].to_numpy()

    meanLat = coords[:, 0].mean()
    latKmPerDeg = 111.0
    lonKmPerDeg = 111.0 * np.cos(np.radians(meanLat))

    coordsScaled = np.column_stack([
        coords[:, 0] * latKmPerDeg,
        coords[:, 1] * lonKmPerDeg
    ])

    return coordsScaled


# 4. HYPERPARAMETER TUNING
def findBestDbscanParams(coordsScaled):
    epsValues = [0.05, 0.1, 0.15, 0.2, 0.25]
    minSamplesValues = [2, 3, 4, 5]

    bestScore = -1
    bestParams = None

    for eps in epsValues:
        for minSamples in minSamplesValues:
            db = DBSCAN(eps=eps, min_samples=minSamples)
            labels = db.fit_predict(coordsScaled)

            clusterIds = set(labels)
            realClusters = clusterIds - {-1}

            if len(realClusters) < 2:
                continue

            mask = labels != -1
            if np.sum(mask) <= 1:
                continue

            silScore = silhouette_score(coordsScaled[mask], labels[mask])

            if silScore > bestScore:
                bestScore = silScore
                bestParams = (eps, minSamples)

    return bestParams


# 5. FINAL DBSCAN
def runDbscan(df, coordsScaled, params):
    bestEps, bestMinSamples = params
    db = DBSCAN(eps=bestEps, min_samples=bestMinSamples)
    df["clusterId"] = db.fit_predict(coordsScaled)
    return df


# 6. BOOST SEVERITY
def boostSeverity(df):
    def boost(row):
        if row["clusterId"] == -1:
            return row["severity"]
        return min(1.0, row["severity"] * 1.2)

    df["severityBoosted"] = df.apply(boost, axis=1)
    return df


# 7. API ENDPOINT
@app.get("/heatmap")
def getHeatMap():
    df = loadFromSupabase()
    df = applySeverity(df)
    coordsScaled = scaleCoords(df)

    bestParams = findBestDbscanParams(coordsScaled)

    if bestParams is None:
        df["severityBoosted"] = df["severity"]
    else:
        df = runDbscan(df, coordsScaled, bestParams)
        df = boostSeverity(df)

    # RETURN CLEAN FORMAT
    return [
        {
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "intensity": float(row["severityBoosted"])
        }
        for _, row in df.iterrows()
    ]


    def normalize_direction(value):
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return "Unknown"
        text = str(value).strip()
        if not text:
            return "Unknown"
        key = text.lower()
        return direction_aliases.get(key, text.title())

    heatPoints = []
    for _, row in df.iterrows():
        direction = normalize_direction(row.get("direction"))
        timestamp_val = row.get("timestamp")
        try:
            timestamp_int = int(timestamp_val) if not pd.isna(timestamp_val) else None
        except Exception:
            timestamp_int = None

        heatPoints.append(
            {
                "lat": float(row["lat"]),
                "lon": float(row["lon"]),
                "intensity": float(row["severityBoosted"]),
                "direction": direction,
                "type": str(row.get("type") or "unknown").lower(),
                "timestamp": timestamp_int,
                "description": row.get("description") or "",
            }
        )

    return heatPoints

import math

def runKalmanForCluster(clusterDf, qFactor=0.01):
    """
    clusterDf: df with columns [lat, lon, timestampDt], all same clusterId, sorted by time.
    Returns: (historyPoints, predictedPoints) where each is a list of [lat, lon].
    """
    # If not enough points, skip
    if len(clusterDf) < 2:
        return [], []

    # Convert lat/lon to a local X/Y system (in km)
    lats = clusterDf["lat"].to_numpy()
    lons = clusterDf["lon"].to_numpy()
    time_col = "timestampDt"
    if "timestamp_dt" in clusterDf.columns:
        time_col = "timestamp_dt"
    times = clusterDf[time_col].to_numpy()

    meanLat = lats.mean()
    latKmPerDeg = 111.0
    lonKmPerDeg = 111.0 * math.cos(math.radians(meanLat))

    xs = lats * latKmPerDeg
    ys = lons * lonKmPerDeg

    # Initial state: [x, y, vx, vy]
    x0 = xs[0]
    y0 = ys[0]
    vx0 = 0.0
    vy0 = 0.0

    state = np.array([[x0], [y0], [vx0], [vy0]], dtype=float)

    # Initial covariance
    P = np.eye(4) * 1.0

    # Measurement matrix: we observe x, y
    H = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0]
    ], dtype=float)

    R = np.eye(2) * 0.05  # measurement noise
    Q_base = qFactor         # process noise factor

    historyPoints = []

    prevTime = times[0]

    for i in range(len(xs)):
        if i == 0:
            # first measurement = initial filtered point
            histLat = xs[0] / latKmPerDeg
            histLon = ys[0] / lonKmPerDeg
            historyPoints.append([histLat, histLon])
            continue

        currentTime = times[i]
        # Support numpy datetime64 differences as well as Python timedeltas
        delta = currentTime - prevTime
        if hasattr(delta, "total_seconds"):
            dt = delta.total_seconds()
        else:
            dt = float(delta / np.timedelta64(1, "s"))
        if dt <= 0:
            dt = 1.0  # fallback

        # State transition matrix F depends on dt
        F = np.array([
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1,  0],
            [0, 0, 0,  1]
        ], dtype=float)

        # Simple process noise
        Q = np.eye(4) * Q_base

        # 1) Predict
        state = F @ state
        P = F @ P @ F.T + Q

        # 2) Update with measurement
        z = np.array([[xs[i]], [ys[i]]])  # measurement position
        y_residual = z - (H @ state)
        S = H @ P @ H.T + R
        K = P @ H.T @ np.linalg.inv(S)
        state = state + K @ y_residual
        P = (np.eye(4) - K @ H) @ P

        # Store filtered position
        filtX = state[0, 0]
        filtY = state[1, 0]
        histLat = filtX / latKmPerDeg
        histLon = filtY / lonKmPerDeg
        historyPoints.append([histLat, histLon])

        prevTime = currentTime

    # Predict future path (e.g. 3 steps of 10 seconds)
    predictedPoints = []
    futureSteps = 3
    dtFuture = 10.0  # seconds

    for _ in range(futureSteps):
        F = np.array([
            [1, 0, dtFuture, 0],
            [0, 1, 0, dtFuture],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ], dtype=float)

        state = F @ state
        P = F @ P @ F.T + (np.eye(4) * Q_base)

        futX = state[0, 0]
        futY = state[1, 0]
        futLat = futX / latKmPerDeg
        futLon = futY / lonKmPerDeg
        predictedPoints.append([futLat, futLon])

    return historyPoints, predictedPoints

def runMultipleKalmanPaths(clusterDf):
    configs = [
        ("high", 0.005, 0.90),
        ("medium", 0.02, 0.60),
        ("low", 0.05, 0.30)
    ]
    results = {}
    for name, q, prob in configs:
        history, prediction = runKalmanForCluster(clusterDf, qFactor=q)
        results[name] = {
            "history": history,
            "prediction": prediction,
            "probability": prob
        }
    return results

def buildFlightPaths(df):
    """
    df: dataframe after DBSCAN, with cluster ids and timestamps.
    Returns: list of dicts with probabilistic paths per cluster,
    where each cluster's predictions extend toward the next cluster centroid.
    """
    entries = []
    cluster_col = "cluster_id" if "cluster_id" in df.columns else "clusterId"
    time_col = "timestamp_dt" if "timestamp_dt" in df.columns else "timestampDt"

    clusterIds = sorted([cid for cid in df[cluster_col].unique() if cid != -1])

    for cid in clusterIds:
        clusterDf = df[df[cluster_col] == cid].sort_values(time_col)
        multiPaths = runMultipleKalmanPaths(clusterDf)
        centroidLat = float(clusterDf["lat"].mean())
        centroidLon = float(clusterDf["lon"].mean())

        entries.append({
            "clusterId": int(cid),
            "paths": multiPaths,
            "centroid": [centroidLat, centroidLon],
        })

    for idx in range(len(entries) - 1):
        currentEntry = entries[idx]
        nextCentroid = np.array(entries[idx + 1]["centroid"], dtype=float)
        currentCentroid = np.array(currentEntry["centroid"], dtype=float)
        vec = nextCentroid - currentCentroid
        dist = np.linalg.norm(vec)
        if dist == 0:
            perp = np.array([0.0, 0.0])
        else:
            perp = np.array([-vec[1], vec[0]]) / dist

        offsets = {
            "high": 0.0,
            "medium": 0.05 * dist,
            "low": -0.05 * dist,
        }

        for name, offset in offsets.items():
            pathConfig = currentEntry["paths"].get(name)
            if not pathConfig:
                continue
            prediction = list(pathConfig.get("prediction") or [])
            targetPoint = nextCentroid + perp * offset
            prediction.append(targetPoint.tolist())
            pathConfig["prediction"] = prediction

    return [
        {
            "clusterId": entry["clusterId"],
            "paths": entry["paths"],
        }
        for entry in entries
    ]

@app.get("/flightpaths")
def getFlightPaths():
    df = loadFromSupabase()
    df = applySeverity(df)
    coordsScaled = scaleCoords(df)

    bestParams = findBestDbscanParams(coordsScaled)

    if bestParams is None:
        return []

    df = runDbscan(df, coordsScaled, bestParams)
    
    # ensure timestamps are parsed (in case)
    if "timestamp_dt" not in df.columns:
        if "timestampDt" in df.columns:
            df["timestamp_dt"] = df["timestampDt"]
        else:
            df["timestamp_dt"] = pd.to_datetime(df["timestamp"], unit="ms")
    if "cluster_id" not in df.columns and "clusterId" in df.columns:
        df["cluster_id"] = df["clusterId"]

    flightPaths = buildFlightPaths(df)

    return flightPaths
