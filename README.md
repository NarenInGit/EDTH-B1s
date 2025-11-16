# Civilian Threat Reporting Platform (EDTH 2025)

> ⚠️ Hackathon prototype – work in progress.

This project is a prototype built during the **European Defence Tech Hackathon (13–16 Nov)**.  
The goal: enable civilians to **report threats in real time** (e.g. drones, explosions, troop movement) and turn this **crowdsourced data** into **actionable insights** for responders via an AI-powered heatmap.

---

## 🎯 Core Idea

- Civilians submit reports with:
  - Location (GPS)
  - Threat type (drone, explosion, troop movement, suspicious activity)
  - Optional description + photo
- Backend stores the data, runs **ML clustering (DBSCAN)** and **severity scoring**
- Frontend displays:
  - An interactive **heatmap** of threat density
  - Recent reports and metadata

---

## 🧱 Tech Stack

**Frontend**
- React + Vite
- UI based on Figma designs
- Geolocation (browser API)
- Heatmap view (Leaflet / heatmap layer)

**Backend**
- FastAPI (Python)
- DBSCAN clustering for hotspot detection
- (Optional) Kalman filtering for smoothing / trajectory estimation
- REST API endpoints:
  - `/report` – submit a new report
  - `/heatmap` – fetch processed heatmap points
  - `/capture` – upload captured images (from camera)

**Database / Storage**
- Supabase (PostgreSQL + Storage)
- `reports` table for structured threat reports
- Storage bucket for uploaded images

---

## 🚧 Project Status

This is a **hackathon prototype**, so:
- Expect rough edges / hardcoded values
- Architecture is subject to change
- Not production-ready (yet)

---

## ▶️ How to Run (Placeholder)

### Backend (FastAPI)
1. Create and activate a virtual environment  
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
