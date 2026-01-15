# Quick Start: Deploy on Local VM

This is a condensed guide for deploying on your local VM. For detailed instructions, see [LOCAL_VM_DEPLOYMENT.md](./LOCAL_VM_DEPLOYMENT.md).

## Prerequisites

- Ubuntu 22.04 VM (or any Linux distro)
- 2-4 GB RAM
- 20 GB disk space
- Network connectivity

## Quick Setup (15 minutes)

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Install Docker Compose
```bash
sudo apt install docker-compose-plugin -y
```

### 4. Get Project Files
```bash
cd ~
# Option A: Clone from Git
git clone <your-repo-url>
cd PDS

# Option B: Transfer files via SCP or shared folder
```

### 5. Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
nano .env
# Set: JWT_SECRET=your-secret-key-here
# Save: Ctrl+X, Y, Enter

# Frontend
cd ../frontend
cp .env.example .env
# Keep default or update with VM IP if accessing from network
```

### 6. Deploy
```bash
cd ~/PDS
docker compose up -d --build
```

### 7. Verify
```bash
# Check status
docker compose ps

# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost
```

## Access Application

- **From VM**: http://localhost
- **From Host** (with port forwarding): http://localhost:3000
- **From Network** (bridged mode): http://vm-ip-address

## Common Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart

# Rebuild after changes
docker compose up -d --build
```

## Troubleshooting

**Services not starting?**
```bash
docker compose logs
docker ps -a
```

**Can't access from host/network?**
- Check VM network settings (Bridged or NAT with port forwarding)
- Check firewall: `sudo ufw allow 80/tcp && sudo ufw allow 5000/tcp`
- Verify ports: `docker ps`

**Need help?** See [LOCAL_VM_DEPLOYMENT.md](./LOCAL_VM_DEPLOYMENT.md) for detailed guide.
