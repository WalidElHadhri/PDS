# Setup Guide

This guide will help you set up and run the SaaS Collaborative Platform locally.

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- Git

## Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PDS
   ```

2. **Set up environment variables**
   
   Create `backend/.env` from the example:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and set a strong `JWT_SECRET`:
   ```
   JWT_SECRET=your-very-secure-secret-key-here
   ```

   Create `frontend/.env` from the example:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/pds`)
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)

4. **Start MongoDB**
   - Install MongoDB locally, or
   - Use Docker: `docker run -d -p 27017:27017 mongo:7`

5. **Run the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `REACT_APP_API_URL`: Backend API URL (default: `http://localhost:5000/api`)

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Project Structure

```
PDS/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth and access control
│   ├── tests/           # Test files
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utility functions
│   │   └── App.js
│   └── package.json
├── docker-compose.yml   # Docker Compose configuration
└── .github/
    └── workflows/       # CI/CD pipelines
```

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the `MONGODB_URI` in `backend/.env`
- For Docker Compose, MongoDB service name is `mongodb`

### Port Already in Use

- Change ports in `docker-compose.yml` or `.env` files
- Kill processes using the ports:
  - Windows: `netstat -ano | findstr :5000`
  - Linux/Mac: `lsof -i :5000`

### CORS Issues

- Ensure backend CORS is configured correctly
- Check `REACT_APP_API_URL` in frontend `.env`

### Docker Issues

- Rebuild containers: `docker-compose up --build`
- Remove volumes: `docker-compose down -v`
- Check logs: `docker-compose logs`

## Next Steps

1. Create your first user account
2. Create a project
3. Invite collaborators
4. Add documentation and versions

For deployment instructions, see the deployment documentation.
