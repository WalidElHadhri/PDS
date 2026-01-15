# Quick Deployment Steps

This is a condensed version of the deployment guide. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites

1. Cloud account (AWS or Azure)
2. MongoDB Atlas account (free tier available)
3. Domain name (optional)

## Quick Steps

### 1. Set Up MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (for testing)
6. Get connection string

### 2. Prepare Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pds
JWT_SECRET=generate-strong-secret-here-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 3. Choose Deployment Method

#### Option A: AWS EC2 (Simple, ~$10/month)

```bash
# 1. Launch EC2 instance (Ubuntu, t2.micro)
# 2. Connect via SSH
ssh -i key.pem ubuntu@your-ec2-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone repository
git clone <your-repo>
cd PDS

# 6. Configure .env files (backend/.env and frontend/.env)

# 7. Update docker-compose.yml to use MongoDB Atlas (remove mongodb service)

# 8. Deploy
docker-compose up -d --build
```

#### Option B: AWS Elastic Beanstalk (Managed, ~$15/month)

```bash
# Install EB CLI
pip install awsebcli

# Backend
cd backend
eb init
eb create pds-backend-prod
eb setenv MONGODB_URI="..." JWT_SECRET="..." NODE_ENV=production
eb deploy

# Frontend
cd ../frontend
npm run build
# Deploy to S3 + CloudFront (see DEPLOYMENT.md)
```

#### Option C: Azure App Service (Managed, ~$13/month)

```bash
# Install Azure CLI
az login

# Backend
az group create --name pds-rg --location eastus
az appservice plan create --name pds-plan --resource-group pds-rg --sku B1 --is-linux
az webapp create --resource-group pds-rg --plan pds-plan --name pds-backend --runtime "NODE:18-lts"
az webapp config appsettings set --resource-group pds-rg --name pds-backend --settings MONGODB_URI="..." JWT_SECRET="..."

# Frontend
az staticwebapp create --name pds-frontend --resource-group pds-rg
swa deploy ./build --app-name pds-frontend
```

### 4. Configure Security

- Update CORS in backend to allow frontend domain
- Set up HTTPS (use cloud provider's managed certificates)
- Update frontend API URL to production backend
- Rebuild and redeploy frontend

### 5. Verify Deployment

1. Test backend: `curl https://your-backend.com/api/health`
2. Test frontend: Open in browser
3. Register a test user
4. Create a test project

## Estimated Costs

- **MongoDB Atlas**: Free (M0 tier)
- **AWS EC2**: ~$10/month (t2.micro)
- **AWS Elastic Beanstalk**: ~$15/month
- **Azure App Service**: ~$13/month (B1 tier)

## Common Issues

**Backend not connecting to MongoDB:**
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Check environment variables

**Frontend can't reach backend:**
- Update CORS settings
- Verify REACT_APP_API_URL
- Check security groups/firewall

**SSL/HTTPS issues:**
- Use cloud provider's managed certificates
- Configure domain DNS properly

## Next Steps

1. Set up custom domain
2. Configure monitoring
3. Set up automated backups
4. Enable CI/CD pipeline

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
