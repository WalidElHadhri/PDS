# Deployment Guide

This guide provides step-by-step instructions for deploying the SaaS Collaborative Platform to AWS or Azure.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [AWS Deployment](#aws-deployment)
3. [Azure Deployment](#azure-deployment)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] A cloud provider account (AWS or Azure)
- [ ] Docker installed locally
- [ ] Git repository set up
- [ ] Domain name (optional, but recommended)
- [ ] SSL certificate (or use cloud provider's managed certificates)

### Prepare Environment Variables

Create production environment files:

**Backend Production Variables:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pds?retryWrites=true&w=majority
JWT_SECRET=your-very-secure-production-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**Frontend Production Variables:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

**Important**: 
- Generate a strong JWT_SECRET (use `openssl rand -base64 32` or similar)
- Never commit `.env` files to Git
- Use secure password managers for production secrets

---

## AWS Deployment

### Option 1: AWS Elastic Beanstalk (Recommended for Simplicity)

#### Step 1: Set Up MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (M0 cluster is free)
3. Create a new cluster
4. Create a database user:
   - Go to "Database Access"
   - Add new user with username/password
   - Set privileges to "Read and write to any database"
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for testing) or your server IP
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

#### Step 2: Install AWS CLI and EB CLI

```bash
# Install AWS CLI
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt-get install awscli

# Install EB CLI
pip install awsebcli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
# Enter default output format (json)
```

#### Step 3: Deploy Backend

1. **Initialize Elastic Beanstalk:**
   ```bash
   cd backend
   eb init
   # Select region
   # Select "Docker" platform
   # Select "Docker running on 64bit Amazon Linux 2"
   ```

2. **Create Environment:**
   ```bash
   eb create pds-backend-prod
   # This will take 5-10 minutes
   ```

3. **Set Environment Variables:**
   ```bash
   eb setenv \
     PORT=5000 \
     MONGODB_URI="your-mongodb-connection-string" \
     JWT_SECRET="your-production-jwt-secret" \
     JWT_EXPIRES_IN=7d \
     NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

5. **Get Backend URL:**
   ```bash
   eb status
   # Note the CNAME URL (e.g., pds-backend-prod.us-east-1.elasticbeanstalk.com)
   ```

#### Step 4: Deploy Frontend

1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   # Update .env with backend URL
   echo "REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api" > .env.production
   npm run build
   ```

2. **Deploy to S3 + CloudFront:**
   
   a. Create S3 bucket:
   ```bash
   aws s3 mb s3://pds-frontend-prod
   ```

   b. Enable static website hosting:
   ```bash
   aws s3 website s3://pds-frontend-prod --index-document index.html --error-document index.html
   ```

   c. Upload build files:
   ```bash
   aws s3 sync build/ s3://pds-frontend-prod --delete
   ```

   d. Set bucket policy (public read):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::pds-frontend-prod/*"
       }
     ]
   }
   ```

   e. (Optional) Set up CloudFront for HTTPS:
   - Go to CloudFront in AWS Console
   - Create distribution
   - Origin: S3 bucket (pds-frontend-prod)
   - Viewer protocol: Redirect HTTP to HTTPS
   - Default root object: index.html

### Option 2: AWS EC2 with Docker Compose

#### Step 1: Launch EC2 Instance

1. Go to EC2 Console → Launch Instance
2. Choose Ubuntu Server 22.04 LTS
3. Instance type: t2.micro (free tier) or t2.small
4. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP (5000) from anywhere (for backend)
5. Launch and download key pair

#### Step 2: Connect to EC2

```bash
# Windows (PowerShell)
ssh -i your-key.pem ubuntu@your-ec2-ip

# Mac/Linux
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-comose

# Install Git
sudo apt install git -y

# Logout and login again for docker group to take effect
```

#### Step 4: Clone and Configure

```bash
# Clone repository
git clone <your-repo-url>
cd PDS

# Create production .env files
cd backend
nano .env
# Paste production environment variables
# Save: Ctrl+X, Y, Enter

cd ../frontend
nano .env
# Set REACT_APP_API_URL to your EC2 public IP or domain
# Save: Ctrl+X, Y, Enter
```

#### Step 5: Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: pds-mongodb
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: pds
    networks:
      - pds-network
    # Remove port mapping for internal only

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pds-backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    networks:
      - pds-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pds-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pds-network
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  pds-network:
    driver: bridge
```

#### Step 6: Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Step 7: Set Up Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/pds
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Azure Deployment

### Option 1: Azure App Service (Recommended)

#### Step 1: Set Up MongoDB Atlas

Follow the same MongoDB Atlas setup as in AWS section.

#### Step 2: Install Azure CLI

```bash
# Windows: Download from https://aka.ms/installazurecliwindows
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

#### Step 3: Deploy Backend

1. **Create Resource Group:**
   ```bash
   az group create --name pds-rg --location eastus
   ```

2. **Create App Service Plan:**
   ```bash
   az appservice plan create \
     --name pds-plan \
     --resource-group pds-rg \
     --sku B1 \
     --is-linux
   ```

3. **Create Web App:**
   ```bash
   az webapp create \
     --resource-group pds-rg \
     --plan pds-plan \
     --name pds-backend-prod \
     --runtime "NODE:18-lts"
   ```

4. **Configure Environment Variables:**
   ```bash
   az webapp config appsettings set \
     --resource-group pds-rg \
     --name pds-backend-prod \
     --settings \
       PORT=5000 \
       MONGODB_URI="your-mongodb-connection-string" \
       JWT_SECRET="your-production-jwt-secret" \
       JWT_EXPIRES_IN=7d \
       NODE_ENV=production
   ```

5. **Deploy from Docker:**
   ```bash
   # Build and push to Azure Container Registry (ACR)
   az acr create --resource-group pds-rg --name pdsregistry --sku Basic
   az acr login --name pdsregistry
   
   cd backend
   docker build -t pdsregistry.azurecr.io/backend:latest .
   docker push pdsregistry.azurecr.io/backend:latest
   
   # Configure web app to use container
   az webapp config container set \
     --name pds-backend-prod \
     --resource-group pds-rg \
     --docker-custom-image-name pdsregistry.azurecr.io/backend:latest
   ```

#### Step 4: Deploy Frontend

1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   echo "REACT_APP_API_URL=https://pds-backend-prod.azurewebsites.net/api" > .env.production
   npm run build
   ```

2. **Deploy to Static Web Apps:**
   ```bash
   # Install Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli
   
   # Create Static Web App
   az staticwebapp create \
     --name pds-frontend-prod \
     --resource-group pds-rg \
     --location eastus2
   
   # Deploy
   swa deploy ./build \
     --app-name pds-frontend-prod \
     --resource-group pds-rg
   ```

### Option 2: Azure Container Instances

1. **Create Resource Group:**
   ```bash
   az group create --name pds-rg --location eastus
   ```

2. **Deploy MongoDB (or use Atlas):**
   ```bash
   az container create \
     --resource-group pds-rg \
     --name pds-mongodb \
     --image mongo:7 \
     --ports 27017
   ```

3. **Deploy Backend:**
   ```bash
   az container create \
     --resource-group pds-rg \
     --name pds-backend \
     --image your-registry/backend:latest \
     --ports 5000 \
     --environment-variables \
       MONGODB_URI="mongodb://pds-mongodb:27017/pds" \
       JWT_SECRET="your-secret" \
       NODE_ENV=production
   ```

4. **Deploy Frontend:**
   ```bash
   az container create \
     --resource-group pds-rg \
     --name pds-frontend \
     --image your-registry/frontend:latest \
     --ports 80
   ```

---

## Post-Deployment Configuration

### 1. Set Up Custom Domain (Optional)

**AWS:**
- Go to Route 53 or your DNS provider
- Add A record pointing to your EC2 IP or CloudFront distribution
- Configure SSL certificate in CloudFront or use Let's Encrypt

**Azure:**
- Go to App Service → Custom domains
- Add your domain
- Configure SSL certificate (free managed certificate available)

### 2. Update CORS Settings

Update backend CORS to allow your frontend domain:

```javascript
// backend/server.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

### 3. Update Frontend API URL

Update frontend `.env` with production backend URL:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

Rebuild and redeploy frontend.

### 4. Set Up Monitoring

**AWS:**
- CloudWatch for logs and metrics
- Set up alarms for errors

**Azure:**
- Application Insights
- Monitor logs in App Service

### 5. Set Up Automated Backups

**MongoDB Atlas:**
- Enable automated backups in Atlas dashboard
- Configure backup schedule

**Application:**
- Set up automated deployments via GitHub Actions
- Configure CI/CD pipeline

---

## Troubleshooting

### Backend Not Starting

1. Check logs:
   ```bash
   # Docker
   docker logs pds-backend
   
   # AWS EB
   eb logs
   
   # Azure
   az webapp log tail --name pds-backend-prod --resource-group pds-rg
   ```

2. Verify environment variables are set correctly
3. Check MongoDB connection string
4. Verify ports are open in security groups/firewall

### Frontend Can't Connect to Backend

1. Check CORS configuration
2. Verify `REACT_APP_API_URL` is correct
3. Check browser console for errors
4. Verify backend is accessible (test API endpoint directly)

### Database Connection Issues

1. Verify MongoDB Atlas IP whitelist includes your server IP
2. Check connection string format
3. Verify database user credentials
4. Test connection from server:
   ```bash
   docker exec -it pds-backend node -e "require('mongoose').connect('your-uri').then(() => console.log('Connected'))"
   ```

### SSL/HTTPS Issues

1. Ensure SSL certificate is properly configured
2. Check that HTTPS redirects are set up
3. Verify domain DNS records
4. Clear browser cache and cookies

---

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enabled
- [ ] Environment variables secured (not in code)
- [ ] Database credentials rotated regularly
- [ ] Security groups/firewall rules minimal
- [ ] Regular security updates applied
- [ ] Backups configured
- [ ] Monitoring and alerting set up

---

## Cost Optimization

**AWS:**
- Use free tier (t2.micro EC2, S3)
- Use MongoDB Atlas free tier (M0)
- Consider reserved instances for production

**Azure:**
- Use free tier (F1 App Service)
- Use MongoDB Atlas free tier
- Consider reserved capacity

**General:**
- Monitor usage and costs
- Set up billing alerts
- Use auto-scaling for production workloads

---

## Next Steps

1. Set up CI/CD pipeline for automated deployments
2. Configure monitoring and alerting
3. Set up automated backups
4. Implement log aggregation
5. Configure auto-scaling for high availability
6. Set up staging environment for testing

---

## Support Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Azure Documentation](https://docs.microsoft.com/azure)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
