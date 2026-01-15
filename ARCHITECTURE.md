# Architecture Documentation

## System Overview

The SaaS Collaborative Platform is a full-stack web application built with a microservices-oriented architecture, separating frontend and backend concerns.

## Architecture Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼─────────────────────────────────┐
│         Frontend (React)                │
│  - React Router                         │
│  - Context API (Auth)                   │
│  - Axios (HTTP Client)                  │
└──────┬──────────────────────────────────┘
       │
       │ REST API
       │
┌──────▼─────────────────────────────────┐
│      Backend (Node.js + Express)        │
│  - RESTful API                          │
│  - JWT Authentication                   │
│  - Role-based Access Control            │
└──────┬──────────────────────────────────┘
       │
       │ Mongoose ODM
       │
┌──────▼─────────────────────────────────┐
│         MongoDB Database                │
│  - Users                                │
│  - Projects                             │
│  - Versions                             │
└─────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Web Server**: Nginx (production)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS or Azure (deployment)

## Backend Architecture

### Directory Structure
```
backend/
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Project.js
│   └── Version.js
├── routes/           # API route handlers
│   ├── auth.js
│   ├── projects.js
│   ├── collaborators.js
│   ├── versions.js
│   └── documentation.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── projectAccess.js
├── tests/            # Test files
├── server.js         # Express app entry point
└── package.json
```

### API Design

#### RESTful Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Projects**
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Collaboration**
- `POST /api/projects/:id/collaborators` - Invite collaborator
- `DELETE /api/projects/:id/collaborators/:userId` - Remove collaborator

**Versions**
- `GET /api/projects/:id/versions` - List versions
- `POST /api/projects/:id/versions` - Create version

**Documentation**
- `GET /api/projects/:id/documentation` - Get documentation
- `PUT /api/projects/:id/documentation` - Update documentation

### Security Architecture

1. **Authentication Flow**
   - User registers/logs in
   - Server validates credentials
   - JWT token issued with user ID
   - Token stored client-side (localStorage)
   - Token sent in Authorization header for protected routes

2. **Authorization**
   - Middleware validates JWT token
   - Project access middleware checks ownership/collaboration
   - Owner-only actions protected by `checkProjectOwner` middleware

3. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Never stored or transmitted in plain text
   - Minimum 6 characters enforced

4. **Input Validation**
   - express-validator for request validation
   - Mongoose schema validation
   - SQL injection not applicable (NoSQL)
   - XSS prevention through proper encoding

## Frontend Architecture

### Directory Structure
```
frontend/src/
├── components/        # Reusable components
│   ├── Navbar.js
│   └── PrivateRoute.js
├── pages/             # Page components
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── CreateProject.js
│   └── ProjectDetail.js
├── context/           # React Context
│   └── AuthContext.js
├── utils/             # Utilities
│   └── api.js
├── App.js             # Main app component
└── index.js           # Entry point
```

### State Management

- **AuthContext**: Global authentication state
  - User information
  - Login/Register/Logout functions
  - Token management

- **Local State**: Component-level state using React hooks
  - Form inputs
  - UI state (loading, errors)
  - Project data

### Routing

- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/projects/*`
- PrivateRoute component enforces authentication

## Database Schema

### User Model
```javascript
{
  username: String (unique, required, 3-30 chars)
  email: String (unique, required, validated)
  password: String (hashed, required, min 6 chars)
  timestamps: true
}
```

### Project Model
```javascript
{
  name: String (required, max 100 chars)
  description: String (max 500 chars)
  owner: ObjectId (ref: User)
  collaborators: [{
    user: ObjectId (ref: User)
    role: String (enum: ['Owner', 'Collaborator'])
  }]
  documentation: String (max 10000 chars)
  timestamps: true
}
```

### Version Model
```javascript
{
  project: ObjectId (ref: Project)
  versionNumber: String (required, max 50 chars)
  description: String (max 500 chars)
  createdBy: ObjectId (ref: User)
  timestamps: true
}
```

## Deployment Architecture

### Docker Setup

**Backend Container**
- Node.js 18 Alpine base image
- Production dependencies only
- Exposes port 5000

**Frontend Container**
- Multi-stage build
- Build stage: Node.js with React build
- Production stage: Nginx serving static files
- Exposes port 80

**MongoDB Container**
- Official MongoDB 7 image
- Persistent volume for data
- Exposes port 27017

**Docker Compose**
- Orchestrates all services
- Sets up networking
- Manages dependencies

### CI/CD Pipeline

1. **On Push/PR**
   - Install dependencies
   - Run tests (backend & frontend)
   - Build Docker images
   - Test Docker Compose setup

2. **Deployment** (manual or automated)
   - Push images to container registry
   - Deploy to cloud platform
   - Configure environment variables
   - Set up MongoDB (managed service or container)

## Scalability Considerations

### Current Architecture
- Stateless backend (JWT-based)
- Horizontal scaling ready
- Database connection pooling (Mongoose)

### Future Improvements
- Load balancer for multiple backend instances
- Redis for session/token caching
- CDN for frontend static assets
- Database replication for high availability

## Security Best Practices

1. **Environment Variables**: All secrets in `.env` files
2. **HTTPS**: Ready for SSL/TLS in production
3. **CORS**: Configured for specific origins
4. **Rate Limiting**: Can be added with express-rate-limit
5. **Input Sanitization**: express-validator + Mongoose validation
6. **Error Handling**: Generic error messages in production

## Performance Optimizations

1. **Database Indexing**: Indexes on frequently queried fields
2. **Pagination**: Can be added for large datasets
3. **Caching**: Frontend can cache API responses
4. **Code Splitting**: React lazy loading for routes
5. **Compression**: Nginx gzip compression enabled
