# 🚧 ARIIP – Autonomous Road Infrastructure Intelligence Platform

ARIIP is an AI-powered road hazard detection and management platform that enables citizens and authorities to identify, report, verify, and track road infrastructure defects. The system leverages computer vision to detect potholes and road cracks from uploaded images, automatically assesses severity, assigns the appropriate maintenance department, and maintains a complete incident management workflow.

Designed with a modern React frontend and FastAPI backend, ARIIP streamlines road maintenance operations and helps improve public safety through faster issue identification and resolution.

---

## 🌟 Key Features

### 🤖 AI-Powered Hazard Detection
- Detects road infrastructure defects from uploaded images.
- Supports:
  - Potholes
  - Longitudinal Cracks
  - Crocodile Cracks
- Generates:
  - Hazard Type
  - Confidence Score
  - Severity Level
  - Recommended Department

### 📸 Hazard Reporting
- Upload images from local storage.
- Capture live hazard photos using device camera.
- Automatic image processing and analysis.

### 📍 Smart Location Tracking
- GPS-based location capture.
- Automatic latitude and longitude recording.
- State and city selection support.
- Accurate geographic tagging of incidents.

### 📝 Incident Management System
- Create and store hazard reports.
- Maintain incident records in a centralized database.
- Track incident lifecycle:
  - Created
  - Assigned
  - Resolved

### 🔍 Verification Workflow
- Review reported hazards.
- Verify submitted reports.
- Approve or reject maintenance actions.
- Maintain audit records for accountability.

### 🏢 Department Assignment
- Automatic department recommendation based on detected hazard.
- Supports efficient routing of maintenance requests.

---

## 🏗 System Architecture

```text
┌─────────────────────┐
│   Citizen / User    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ React Frontend UI   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ FastAPI Backend API │
└──────────┬──────────┘
           │
 ┌─────────┼─────────┐
 │         │         │
 ▼         ▼         ▼
AI Model  SQLite   Location
Detection Database Services
           │
           ▼
 Incident Management
           │
           ▼
 Verification Queue
```

---

## 🛠 Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- Lucide React

### Backend
- FastAPI
- Python
- Uvicorn

### Artificial Intelligence
- PyTorch
- OpenCV
- Custom Road Hazard Detection Model

### Database
- SQLite

### Version Control
- Git
- GitHub

---
