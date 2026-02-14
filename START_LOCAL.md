# How to Run the Project Locally

## Prerequisites

1. ✅ Node.js installed (you have v22.15.0)
2. ✅ Dependencies installed (already done)
3. ⚠️ **MongoDB setup required** (see below)

## Step 1: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - 5 minutes)**
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions
- Free cloud database, no installation needed
- Update `backend/.env` with your Atlas connection string

**Option B: Install MongoDB Locally**
- Download: https://www.mongodb.com/try/download/community
- Install MongoDB Community Edition
- Start MongoDB service
- Keep `MONGODB_URI=mongodb://localhost:27017/pds` in `backend/.env`

## Step 2: Verify Environment Files

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pds
JWT_SECRET=academic-project-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: Start the Application

### Option A: Using PowerShell Script (Easiest)

```powershell
.\start-local.ps1
```

This will open two PowerShell windows - one for backend, one for frontend.

### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

## Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `backend/.env`
- Verify MongoDB is running (Atlas or local)
- Check if port 5000 is available: `netstat -ano | findstr :5000`

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` in `frontend/.env`
- Make sure backend is running on port 5000
- Check browser console for CORS errors

### MongoDB Connection Error
- Verify connection string format
- Check IP whitelist in MongoDB Atlas (if using Atlas)
- Ensure MongoDB service is running (if using local)

## Stopping the Servers

- Press `Ctrl+C` in each terminal window
- Or close the PowerShell windows

## Next Steps

1. Register a new user account
2. Create your first project
3. Test all features

Happy coding! 🚀
