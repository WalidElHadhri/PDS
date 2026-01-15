# SaaS Collaborative Platform for Technical Projects

A cloud-based SaaS collaborative platform for managing technical projects, similar to a light academic version of GitHub.

## Project Overview

This platform allows users to:
- Create and manage technical projects
- Collaborate with team members
- Manage project versions (metadata-based)
- Centralize technical documentation
- Access a user dashboard with project statistics

## Technical Stack

- **Backend**: Node.js + Express (REST API)
- **Frontend**: React.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud Deployment**: AWS or Azure

## Project Structure

```
PDS/
├── backend/          # Node.js + Express API
├── frontend/         # React.js application
├── docker-compose.yml # Local development setup
└── .github/          # GitHub Actions workflows
```

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- MongoDB (or use Docker Compose)
- Git

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd PDS
```

2. Create environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pds
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (owner only)

### Collaboration
- `POST /api/projects/:id/collaborators` - Invite collaborator
- `DELETE /api/projects/:id/collaborators/:userId` - Remove collaborator

### Versions
- `GET /api/projects/:id/versions` - List project versions
- `POST /api/projects/:id/versions` - Create version

### Documentation
- `GET /api/projects/:id/documentation` - Get project documentation
- `PUT /api/projects/:id/documentation` - Update documentation

## Development Guidelines

- Backend first approach
- Simple UI design
- Maintainable code structure
- Clear commit messages
- Focus on correctness over features

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

The application can be deployed in multiple ways:

- **Local VM Deployment** (Recommended for academic projects): See [LOCAL_VM_DEPLOYMENT.md](./LOCAL_VM_DEPLOYMENT.md)
- **Cloud Deployment** (AWS/Azure): See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions
- **Quick Reference**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for condensed deployment steps

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control (Owner/Collaborator)
- Environment variables for secrets
- HTTPS-ready configuration

## License

Academic project - Internal use only

## Team

3 students - Deadline: February 20
