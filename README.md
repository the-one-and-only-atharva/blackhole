# Smart Property Agent: Record-Keeping & Discovery System for Sales/Rentals (Blockchain Ready)

## Objective

Create a web app where users can list, search, and verify property records (sale/rent) using verified digital records — ready to plug into a blockchain.

---

## Features

- **Full-stack app:** React frontend, FastAPI backend, MongoDB database
- **Property listing form:**
  - Owner data (select from users)
  - Buyer intent (sale/rent)
  - Location, verification status, rental/sale terms
- **Record Verification Layer:**
  - Hash logs of all data changes (simulating blockchain immutability)
  - Audit log visible to users

---

## Setup

1. **Backend:**
   - Install dependencies: `pip install -r requirements.txt`
   - Set up MongoDB and configure `.env` as needed
   - Run: `uvicorn main:app --reload`
2. **Frontend:**
   - `cd frontend`
   - Install dependencies: `npm install` or `yarn`
   - Run: `npm run dev` or `yarn dev`

---

## Where Blockchain Fits In

- The backend hashes every property change and stores it in an audit log, simulating blockchain-style immutability.
- This design is ready to plug into a real blockchain: instead of (or in addition to) storing hashes in MongoDB, you could anchor them on-chain for tamper-proof verification.

---

## How Fraud Detection Could Be Layered In

- The backend includes a placeholder for fraud detection (e.g., using TensorFlow or other ML models).
- You could analyze new/updated listings for suspicious patterns (duplicate data, unusual terms, etc.) and flag or block them.

---

## How Multi-Agent Systems Could Enforce Verification

- Multiple agents (e.g., notaries, real estate agents, automated bots) could review and sign off on property records.
- The system could require consensus or multi-signature approval before a record is marked as "verified."
- Each agent's action would be logged and hashed for transparency.

---

## Usage Guide

- **Add a property:** Fill out the form, select an owner, and submit.
- **View properties:** See all listings, click to view details and audit log.
- **Audit log:** Shows all changes, with hashes for verification.

---

## Bonus Features (Planned)

- Alerts for duplicate/suspicious listings
- User dashboard with past activity
