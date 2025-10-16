# 🚀 Setup Discus on Another PC

**Quick guide to run this project on a new development machine**

---

## 📋 Prerequisites

### Required Software:
1. **Git** - For cloning the repository
2. **Docker Desktop** - For running all services
3. **Code Editor** (Optional) - VS Code, Sublime, etc.

That's it! No need for Node.js, Python, Visual Studio Build Tools, or any other dependencies.

---

## 🔧 Step-by-Step Setup

### **Step 1: Install Docker Desktop**

#### Windows:
1. Download: https://www.docker.com/products/docker-desktop/
2. Run installer
3. Restart your computer
4. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

#### Mac:
1. Download: https://www.docker.com/products/docker-desktop/
2. Drag Docker.app to Applications
3. Open Docker from Applications
4. Verify: `docker --version`

---

### **Step 2: Clone the Repository**

```bash
# Clone from GitHub
git clone https://github.com/emad313/discus.git

# Navigate to project
cd discus
```

**Or if copying files manually:**
- Copy the entire `discus` folder to the new PC
- Make sure to copy hidden files like `.env`, `.dockerignore`, `.gitignore`

---

### **Step 3: Configure Environment Variables**

The `.env` file should already exist if you copied it. If not:

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
```

**Required Variables in `.env`:**
```env
NODE_ENV=production
PUBLIC_IP=127.0.0.1  # Change to your server's public IP if deploying

# Database
DB_USER=discus
DB_PASSWORD=your_secure_password_here
DB_NAME=discus

# Redis
REDIS_PASSWORD=your_redis_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Mediasoup
MEDIASOUP_NUM_WORKERS=4
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100

# TURN/STUN
TURN_USERNAME=discususer
TURN_PASSWORD=your_turn_password_here
TURN_REALM=discus.local
```

⚠️ **Important:** Change all passwords if deploying to production!

---

### **Step 4: Start the Application**

#### Option A: Use Deployment Script (Easiest)

**Windows:**
```bash
./scripts/deploy.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script will:
- Check Docker installation
- Build all images (takes 5-10 minutes first time)
- Start all services
- Show access URLs

#### Option B: Manual Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

---

### **Step 5: Verify Everything is Running**

```bash
# Check all containers
docker-compose ps

# Should show 5 services running:
# ✅ discus-frontend  (Port 80)
# ✅ discus-backend   (Port 3000)
# ✅ discus-postgres  (Port 5432)
# ✅ discus-redis     (Port 6379)
# ✅ discus-coturn    (Port 3478)
```

---

### **Step 6: Access the Application**

🌐 **Frontend:** http://localhost  
🔧 **Backend API:** http://localhost:3000  
❤️ **Health Check:** http://localhost:3000/health

---

## 🔍 Troubleshooting Common Issues

### Issue: "Docker command not found"
**Solution:** Docker is not installed or not in PATH. Reinstall Docker Desktop.

### Issue: "Port already in use"
**Solution:** Stop the service using the port:
```bash
# Windows - Find process using port 80
netstat -ano | findstr :80
taskkill /PID <pid> /F

# Linux/Mac
sudo lsof -i :80
sudo kill -9 <pid>
```

### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop application. Wait for it to fully start.

### Issue: "Build failed" or "npm install failed"
**Solution:** 
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Backend shows errors in logs
**Solution:** Check backend logs:
```bash
docker-compose logs backend

# Common issues:
# - Database connection: Check DB_PASSWORD in .env
# - Redis connection: Check REDIS_PASSWORD in .env
```

### Issue: Frontend shows blank page
**Solution:**
```bash
# Check nginx logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

---

## 🔄 Development Workflow

### Making Code Changes

After editing code (frontend or backend):

```bash
# Rebuild and restart the service
docker-compose up -d --build backend  # If backend changed
docker-compose up -d --build frontend # If frontend changed

# Or rebuild all
docker-compose up -d --build
```

### View Live Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Stop Services
```bash
# Stop all (keeps data)
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart backend
```

---

## 📦 What Gets Built

When you run `docker-compose build`, Docker will:

1. **Frontend Image:**
   - Install Node.js dependencies
   - Build Vue 3 production bundle
   - Configure Nginx to serve the app
   - Size: ~50MB

2. **Backend Image:**
   - Install build tools (build-essential, python3)
   - Compile Mediasoup C++ dependencies
   - Install Node.js dependencies
   - Configure for 4 workers (100+ users)
   - Size: ~1.5GB (includes compiled Mediasoup)

3. **Other Services:**
   - Pull PostgreSQL 15 Alpine image
   - Pull Redis 7 Alpine image
   - Pull Coturn latest image

**Total first-time build:** ~5-10 minutes  
**Subsequent builds:** ~2-3 minutes (uses cache)

---

## 🌐 Network Ports Used

| Port | Service | Purpose |
|------|---------|---------|
| 80 | Frontend | Web interface |
| 3000 | Backend | API + Socket.io |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Cache |
| 3478 | Coturn | TURN/STUN (UDP/TCP) |
| 10000-10100 | Mediasoup | WebRTC Media (UDP/TCP) |

Make sure these ports are not in use before starting.

---

## 🔐 Security Notes for Production

If deploying to a server (not localhost):

1. **Update PUBLIC_IP in .env:**
   ```env
   PUBLIC_IP=your.server.ip.address
   ```

2. **Change all passwords in .env**

3. **Configure firewall:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 3000/tcp
   sudo ufw allow 3478/tcp
   sudo ufw allow 3478/udp
   sudo ufw allow 10000:10100/tcp
   sudo ufw allow 10000:10100/udp
   ```

4. **Add SSL/HTTPS** (see `docs/DEPLOYMENT.md`)

5. **Enable Docker resource limits:**
   - Already configured in docker-compose.yml
   - Backend: 4 CPU, 4GB RAM max

---

## 📚 Additional Documentation

- **`DEPLOYMENT_SUCCESS.md`** - Deployment status and commands
- **`PROJECT_STATUS.md`** - Complete project documentation
- **`PROJECT_ROADMAP.md`** - 12-week development plan
- **`docs/DEPLOYMENT.md`** - Comprehensive deployment guide
- **`README.md`** - Project overview

---

## ✅ Quick Checklist

Copy this checklist when setting up on a new PC:

- [ ] Install Docker Desktop
- [ ] Verify `docker --version` works
- [ ] Clone/copy project files
- [ ] Copy or create `.env` file
- [ ] Update passwords in `.env`
- [ ] Run `docker-compose build`
- [ ] Run `docker-compose up -d`
- [ ] Check `docker-compose ps` (5 services running)
- [ ] Open http://localhost in browser
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify Mediasoup workers initialized (4 workers)

---

## 🎯 Expected Results

After setup, you should see:

```bash
$ docker-compose ps

NAME              STATUS
discus-backend    Up (healthy)
discus-frontend   Up (healthy)
discus-postgres   Up (healthy)
discus-redis      Up (healthy)
discus-coturn     Up
```

**Backend logs should show:**
```
[INFO] Creating 4 Mediasoup workers...
[INFO] Worker 0 created [pid:XX]
[INFO] Worker 1 created [pid:XX]
[INFO] Worker 2 created [pid:XX]
[INFO] Worker 3 created [pid:XX]
[INFO] 🚀 Server running on http://localhost:3000
```

**Browser should show:**
- Discus landing page at http://localhost
- "Create Meeting" and "Join Meeting" buttons
- Clean UI with no errors in console

---

## 💡 Pro Tips

### Speed Up Rebuilds
```bash
# Only rebuild changed service
docker-compose build backend
docker-compose up -d backend
```

### Clear Everything and Start Fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Run Commands Inside Containers
```bash
# Access PostgreSQL
docker exec -it discus-postgres psql -U discus

# Access Redis CLI
docker exec -it discus-redis redis-cli

# Access backend shell
docker exec -it discus-backend sh

# Access frontend shell
docker exec -it discus-frontend sh
```

### Monitor Resource Usage
```bash
docker stats
```

---

## 🚨 Known Issues

### Windows Specific:
- **Port 80 in use:** Stop IIS or other web servers
- **Hyper-V required:** Enable in Windows Features
- **WSL 2 backend:** Docker Desktop uses WSL 2 (faster)

### Mac Specific:
- **Performance:** Docker on Mac is slower than Linux
- **File permissions:** Sometimes requires `sudo` for Docker commands

### Linux Specific:
- **Permission denied:** Add user to docker group: `sudo usermod -aG docker $USER`
- **Firewall:** May need to configure `ufw` or `iptables`

---

## 🤝 Need Help?

1. Check logs: `docker-compose logs -f`
2. Read `DEPLOYMENT_SUCCESS.md` for troubleshooting
3. Check `docs/DEPLOYMENT.md` for advanced topics
4. Review `PROJECT_STATUS.md` for architecture details

---

**🎉 That's it! Your development environment is ready on the new PC!**

The entire stack (frontend, backend, database, cache, TURN server) runs in Docker containers. No need to install Node.js, Python, or any other dependencies on your machine.

**Total setup time: ~15 minutes** (including Docker installation and first build)

---

**Last Updated:** October 15, 2025  
**Tested On:** Windows 11, Ubuntu 22.04, macOS Sonoma  
**Docker Version:** 28.5.1+
