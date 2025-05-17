# Blackhole: Property Management & Fraud Detection Platform

## Overview

Blackhole is a full-stack property management platform with advanced fraud detection. It features a modern React frontend (Vite) and a FastAPI backend with MongoDB. The system includes machine learning-based fraud detection using scikit-learn (sklearn IsolationForest), audit logging, and a secure authentication system.

## Features

- Property CRUD (Create, Read, Update, Delete)
- User authentication (JWT-based)
- Audit log with blockchain-style hash chaining
- Machine learning fraud detection (IsolationForest, sklearn)
- Risk scoring and pattern-based fraud checks
- Modern, responsive UI (React, Tailwind, Framer Motion)
- Owner and verification status display
- Secure API with role-based access

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, MongoDB, Pydantic, scikit-learn, numpy, pandas
- **Auth:** JWT, Passlib

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+
- MongoDB (local or cloud)

### Backend Setup

1. `cd backend`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your MongoDB connection in `db.py` or via environment variables.
4. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

### Usage

- Access the frontend at `http://localhost:5173`
- The backend runs at `http://localhost:8000`
- Register/login, add properties, and view audit logs with fraud detection results

## Development

- Backend code: `backend/`
- Frontend code: `frontend/src/`
- Update fraud detection logic in `backend/verification.py`
- Update UI in `frontend/src/components/`

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT (or specify your license here)
