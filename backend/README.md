# EcoSort Backend (Minimal Demo)

This is a small, demo-ready backend for the EcoSort frontend project. It uses Node.js, Express and MongoDB (mongoose).

Features
- Stores waste scan records
- Exposes REST APIs for fetching records and analytics
- Health check route
- Seed script to populate demo data

Getting started
1. Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` (default).
2. Open a terminal in `backend/` and install dependencies:

```powershell
cd backend
npm install
```

3. Create a `.env` file (optional). You can copy `.env.example`:

```powershell
copy .env.example .env
```

4. Seed demo data (optional, only when DB empty):

```powershell
npm run seed
```

5. Start the server:

```powershell
npm run dev   # uses nodemon
# or
npm start
```

APIs
- `GET /api/health` - basic health check
- `POST /api/waste/scan` - store a waste scan
  - Body: `{ qrCode, itemName, category, impact }`
- `GET /api/waste` - list all scans
- `GET /api/waste/stats` - aggregated stats: `totalScans`, `categoryWiseCount`

Model
- `WasteScan` fields: `qrCode`, `itemName`, `category` (dry|wet|ewaste|hazardous), `timestamp`, `impact` (`co2Saved`, `energySaved`)

Notes
- No authentication (demo single-user)
- Designed to be small and clear for evaluations and demos

Utilities
- (No additional utilities are required; seed and server scripts are listed above.)
