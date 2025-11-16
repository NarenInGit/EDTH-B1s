<h1 align="center">
  <br>
  <a href="#"><img src="logo.jpg" alt="Threat Link Logo" width="350"></a>

</h1>

<h4 align="center">A web-based civilian protection and intelligence platform providing verified alerts, secure emergency help, and crowdsourced intelligence.</h4>

<p align="center">
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-Hackathon-orange" alt="Status"></a>
</p>

<p align="center">
<a href="#key-features">Key Features</a> •
<a href="#architecture">Architecture</a> •
<a href="#installation">Installation</a> •
<a href="#usage">Usage</a> •
<a href="#experimental">Experimental / Prototype</a> •
<a href="#AI disclosure">AI disclosure</a> •
<a href="#credits">Credits</a> •
<a href="#license">License</a>

</p>

---

## Key Features

### 1. Report Threat
- Open the **Report Threat** tab.
- Select the type of threat (drone, explosion, suspicious activity, troop movement, etc.).
- Point your phone or device in the direction of the threat.
- Optionally add a description or photo.
- Submit the report — it will appear on the Heat Map automatically.

### 2. Help Request
- Open the **Help Request** tab.
- Fill in the type of help needed.
- Your location is automatically sent with the request.
- Requests are visible on the map for emergency responders (if integrated in future).

### 3. Heat Map
- Open the **Heat Map** tab.
- View areas with high threat activity.
- ML-based clustering groups related reports.
- ML path estimation predicts potential movement of threats.

### 4. Learn & Prepare
- Open the **Learn & Prepare** tab.
- View the latest news.
- Browse drone and weapon identification guides.
- Understand region and threat level.
- Access First Aid instructions.

> ⚠️ Note: Some features are currently in prototype stage and may not be fully functional.

---

## Architecture

Threat Link is designed as a fully automatic, real-time threat reporting and visualization platform.

### Core Components

- **Web App**
  - Responsive, mobile-first interface
  - Simple one-tap reporting (direction, photo, description)
  - Interactive map with ML-based clustering and heatmap generation
  - Displays news and updates (feature in progress)

- **Backend**
  - Automatically processes all incoming reports from the web app
  - ML-powered clustering groups related events and generates dynamic heat zones
  - ML path estimation predicts potential movement of reported threats
  - No manual validation or admin involvement required
  - Contains a prototype Python script for automated news fetching (not integrated into the system yet)

- **Map Engine**
  - Renders clusters, heatmaps, and predicted movement paths
  - Updates in real time as new reports arrive

- **Database**
  - Stores reports securely with:
    - timestamp  
    - latitude & longitude  
    - direction (from phone compass)  
    - optional description  
  - Structured for future expansion (image uploads, advanced location verification)

### Security Philosophy (Current State)

- **Open Reporting:** Any user with access to the web app can submit a report.
- **ML-Based Noise Reduction:** Machine learning helps identify patterns, filter out noise, and prevent map overload.
- **Future-Ready:** The system architecture is prepared for additional security layers such as geofencing and location verification.

---

## Installation

To run locally:

```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
pip install -r requirements.txt
python main.py
```

## Usage

The web app provides four main tabs to help civilians and authorities stay informed and respond quickly:

- **Report Threat:** Quickly submit sightings of drones, explosions, suspicious activity, or troop movements.  
- **Help Request:** Send a request for assistance directly from your location.  
- **Heat Map:** Visualize reported threat activity, clusters, and predicted movement paths.  
- **Learn & Prepare:** Access guides for recognizing threats, first aid instructions, and regional safety updates.

> ⚠️ Note: Some features are still in prototype stage and may not be fully functional.


## Experimental / Prototype

This folder contains experimental code snippets and features that are **not integrated** into the main application.  
These are included for reference, testing, and future development purposes only.
- `news_update.py`: Prototype script for fetching news from NewsAPI and storing in Supabase.

> ⚠️ Warning: These files are **not production-ready** and may not work without further setup.


## AI Disclosure

During the development of Threat Link, AI-powered tools were used to assist in structuring the code, improving readability, and enhancing maintainability. Specifically:

- **Chat GPT Codex / Claude Code:** Suggested code snippets, refactoring ideas, and best practices.  
- **ChatGPT and other language models:** Helped with writing documentation, organizing project structure, and generating human-readable explanations.  

> ⚠️ Important: All final code and implementation decisions were reviewed and written by the development team. AI tools were used solely as assistants to improve workflow efficiency and code clarity, not as a replacement for human development or decision-making.


## Credits

- **Development Team:** Neal, Naren, Paul, Kaspar
- **Hackathon:** EDTH Hackathon 2025, Berlin  
- **AI Tools Used:** GitHub Copilot (Codex), ChatGPT, other AI agents for code structuring, documentation, and readability  
- **Open-Source Libraries / Frameworks:**
  - Python
  - FastAPI
  - Figma
  - Supabase
  - React / JavaScript (for frontend)
  - Leaflet.js or other map libraries
- **APIs Used:**  Supabase API, newsapi, add other API
- **Design Assets / Icons:** Nano Banana AI
- **Inspiration / References:** https://newsapi.org/, https://chatgpt.com, https://www.figma.com/, add more

## License

This project is licensed under the MIT License.

---
> Disclaimer: This project was created for the European Defense Tech Hackathon – Berlin. Everything uploaded is a prototype and not a finished product. Features may be incomplete, experimental, or in development.
