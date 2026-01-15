# Local VM Deployment Guide

This guide will help you deploy the SaaS Collaborative Platform on your local virtual machine for academic purposes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VM Setup](#vm-setup)
3. [Install Dependencies](#install-dependencies)
4. [Deploy Application](#deploy-application)
5. [Network Configuration](#network-configuration)
6. [Accessing the Application](#accessing-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A virtual machine (VMware, VirtualBox, Hyper-V, or any VM software)
- VM with at least:
  - 2 GB RAM (4 GB recommended)
  - 20 GB disk space
  - Network connectivity
- Operating System: Ubuntu 22.04 LTS (recommended) or any Linux distribution

---

## VM Setup

### Step 1: Install Ubuntu on VM

1. Download Ubuntu 22.04 LTS ISO from [ubuntu.com](https://ubuntu.com/download)
2. Create a new VM in your virtualization software
3. Allocate resources:
   - RAM: 2-4 GB
   - Disk: 20-30 GB
   - Network: NAT or Bridged (Bridged recommended for network access)
4. Install Ubuntu using the ISO
5. Complete the installation and boot into Ubuntu

### Step 2: Initial System Update

```bash
# Update package list
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Reboot if kernel was updated
sudo reboot
```

### Step 3: Configure Network (Optional - for external access)

If you want to access the application from other devices on your network:

1. **Set Static IP (Optional but Recommended):**
   ```bash
   # Edit network configuration
   sudo nano /etc/netplan/00-installer-config.yaml
   ```

   Add/Modify:
   ```yaml
   network:
     version: 2
     renderer: networkd
     ethernets:
       enp0s3:  # Change to your interface name (use: ip a)
         dhcp4: false
         addresses:
           - 192.168.1.100/24  # Change to your desired IP
         gateway4: 192.168.1.1  # Your router IP
         nameservers:
           addresses:
             - 8.8.8.8
             - 8.8.4.4
   ```

   Apply changes:
   ```bash
   sudo netplan apply
   ```

2. **Configure Firewall:**
   ```bash
   # Install UFW (if not installed)
   sudo apt install ufw -y

   # Allow SSH
   sudo ufw allow 22/tcp

   # Allow HTTP
   sudo ufw allow 80/tcp

   # Allow backend API port
   sudo ufw allow 5000/tcp

   # Enable firewall
   sudo ufw enable

   # Check status
   sudo ufw status
   ```

---

## Install Dependencies

### Step 1: Install Docker

```bash
# Remove old versions if any
sudo apt-get remove docker docker-engine docker.io containerd runc

# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 2: Install Git

```bash
sudo apt install git -y
git --version
```

### Step 3: Install Additional Tools (Optional)

```bash
# Install useful tools
sudo apt install -y nano htop net-tools
```

---

## Deploy Application

### Step 1: Clone or Transfer Project

**Option A: Clone from Git Repository**
```bash
# Navigate to home directory
cd ~

# Clone repository
git clone <your-repository-url>
cd PDS
```

**Option B: Transfer Files via SCP (from host machine)**
```bash
# From your host machine (Windows/Mac/Linux)
scp -r /path/to/PDS user@vm-ip:/home/user/
```

**Option C: Use Shared Folder (VMware/VirtualBox)**
1. Enable shared folders in VM settings
2. Copy project files to shared folder
3. Access from VM: `/mnt/hgfs/shared-folder-name` or `/media/sf_shared-folder-name`

### Step 2: Configure Environment Variables

```bash
# Navigate to project directory
cd ~/PDS

# Create backend .env file
cd backend
cp .env.example .env
nano .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/pds
JWT_SECRET=your-academic-project-secret-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Create frontend .env file
cd ../frontend
cp .env.example .env
nano .env
```

Edit `frontend/.env`:
```env
# If accessing from VM only:
REACT_APP_API_URL=http://localhost:5000/api

# If accessing from other devices on network (use VM's IP):
# REACT_APP_API_URL=http://192.168.1.100:5000/api
```

**Important**: If you want to access from other devices, replace `localhost` with your VM's IP address.

### Step 3: Update Docker Compose for Production

The existing `docker-compose.yml` should work, but you can create a production version:

```bash
cd ~/PDS
nano docker-compose.prod.yml
```

Create production compose file:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: pds-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: pds
    networks:
      - pds-network
    restart: unless-stopped

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

### Step 4: Build and Start Services

```bash
# Navigate to project root
cd ~/PDS

# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Wait for all services to start (this may take a few minutes on first build).

### Step 5: Verify Services

```bash
# Check if containers are running
docker ps

# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:80
```

---

## Network Configuration

### Access from Host Machine

If your VM is using NAT networking:

1. **Set up Port Forwarding in VM Software:**

   **VMware:**
   - VM Settings → Network Adapter → NAT → Advanced → Port Forwarding
   - Add rules:
     - Host Port 3000 → Guest Port 80 (Frontend)
     - Host Port 5000 → Guest Port 5000 (Backend)

   **VirtualBox:**
   - VM Settings → Network → Adapter 1 → Advanced → Port Forwarding
   - Add rules:
     - Name: frontend, Protocol: TCP, Host IP: 127.0.0.1, Host Port: 3000, Guest IP: (blank), Guest Port: 80
     - Name: backend, Protocol: TCP, Host IP: 127.0.0.1, Host Port: 5000, Guest IP: (blank), Guest Port: 5000

2. **Access from host:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Access from Other Devices on Network

1. **Use Bridged Networking:**
   - Change VM network adapter to "Bridged" mode
   - VM will get an IP from your router (e.g., 192.168.1.100)

2. **Find VM IP Address:**
   ```bash
   ip a
   # Look for inet address (e.g., 192.168.1.100)
   ```

3. **Update Frontend .env:**
   ```bash
   cd ~/PDS/frontend
   nano .env
   ```
   Change to:
   ```env
   REACT_APP_API_URL=http://192.168.1.100:5000/api
   ```

4. **Rebuild Frontend:**
   ```bash
   cd ~/PDS
   docker compose up -d --build frontend
   ```

5. **Access from other devices:**
   - Frontend: http://192.168.1.100
   - Backend: http://192.168.1.100:5000

### Update CORS for Network Access

If accessing from other devices, update backend CORS:

```bash
cd ~/PDS/backend
nano server.js
```

Find the CORS configuration and update:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:80',
    'http://192.168.1.100',
    'http://192.168.1.100:80',
    // Add your VM IP and any other IPs you'll access from
  ],
  credentials: true
}));
```

Rebuild backend:
```bash
cd ~/PDS
docker compose up -d --build backend
```

---

## Accessing the Application

### From VM Itself

- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### From Host Machine (with port forwarding)

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### From Other Devices on Network

- Frontend: http://vm-ip-address (e.g., http://192.168.1.100)
- Backend API: http://vm-ip-address:5000/api

### Test the Application

1. Open frontend URL in browser
2. Register a new user account
3. Create a project
4. Test all features

---

## Managing the Application

### Start Services

```bash
cd ~/PDS
docker compose up -d
```

### Stop Services

```bash
cd ~/PDS
docker compose down
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Restart Services

```bash
docker compose restart
# Or restart specific service
docker compose restart backend
```

### Update Application

```bash
cd ~/PDS

# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker compose up -d --build
```

### Backup Database

```bash
# Create backup
docker exec pds-mongodb mongodump --out /data/backup

# Copy backup from container
docker cp pds-mongodb:/data/backup ~/mongodb-backup

# Restore backup
docker exec -i pds-mongodb mongorestore /data/backup
```

### Clean Up (if needed)

```bash
# Stop and remove containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Remove images
docker rmi pds-backend pds-frontend
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check container status
docker ps -a

# Check logs
docker compose logs

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(80|5000|27017)'

# Restart Docker service
sudo systemctl restart docker
```

### Cannot Access from Host/Network

1. **Check VM Network Settings:**
   - Ensure VM is using Bridged or NAT with port forwarding
   - Verify VM has network connectivity: `ping 8.8.8.8`

2. **Check Firewall:**
   ```bash
   sudo ufw status
   # Ensure ports 80 and 5000 are allowed
   ```

3. **Check Container Ports:**
   ```bash
   docker ps
   # Verify ports are mapped correctly (0.0.0.0:80->80/tcp)
   ```

4. **Test from VM:**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost
   ```

### Database Connection Issues

```bash
# Check MongoDB container
docker logs pds-mongodb

# Test MongoDB connection
docker exec -it pds-mongodb mongosh
# In mongosh: show dbs

# Restart MongoDB
docker compose restart mongodb
```

### Frontend Can't Connect to Backend

1. **Check .env file:**
   ```bash
   cat frontend/.env
   # Ensure REACT_APP_API_URL is correct
   ```

2. **Rebuild frontend:**
   ```bash
   docker compose up -d --build frontend
   ```

3. **Check browser console for errors**

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Performance Issues

```bash
# Check resource usage
htop

# Check container resource usage
docker stats

# Increase VM resources if needed (RAM, CPU)
```

---

## Security Considerations for Academic Use

1. **Change Default Passwords:**
   - Use strong JWT_SECRET
   - Use strong MongoDB password if exposing MongoDB

2. **Firewall Configuration:**
   - Only open necessary ports
   - Restrict access if possible

3. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker compose pull
   ```

4. **Backup Important Data:**
   - Regularly backup MongoDB data
   - Keep backups of configuration files

---

## Quick Reference Commands

```bash
# Navigate to project
cd ~/PDS

# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up -d --build

# Check status
docker compose ps

# Restart service
docker compose restart backend

# Access MongoDB shell
docker exec -it pds-mongodb mongosh

# View container logs
docker logs pds-backend
docker logs pds-frontend
docker logs pds-mongodb
```

---

## Next Steps

1. **Set up automatic startup** (optional):
   ```bash
   # Create systemd service
   sudo nano /etc/systemd/system/pds.service
   ```

   Add:
   ```ini
   [Unit]
   Description=PDS Application
   Requires=docker.service
   After=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/home/your-username/PDS
   ExecStart=/usr/bin/docker compose up -d
   ExecStop=/usr/bin/docker compose down
   User=your-username
   Group=docker

   [Install]
   WantedBy=multi-user.target
   ```

   Enable:
   ```bash
   sudo systemctl enable pds.service
   sudo systemctl start pds.service
   ```

2. **Set up monitoring** (optional):
   - Install monitoring tools
   - Set up log rotation

3. **Document your setup** for your academic report

---

## Support

For issues specific to your VM setup:
- Check VM software documentation
- Verify network configuration
- Review Docker and Docker Compose logs

For application issues, refer to:
- [SETUP.md](./SETUP.md) - Local development setup
- [USER_MANUAL.md](./USER_MANUAL.md) - User guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical documentation
