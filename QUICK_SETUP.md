# ⚡ Quick Setup Guide - TL;DR

**Run Discus on another PC in 5 minutes**

---

## 📋 What You Need

1. **Docker Desktop** (that's it!)

---

## 🚀 Steps

### 1. Install Docker
- **Windows/Mac:** Download from https://www.docker.com/products/docker-desktop/
- **Linux:** `curl -fsSL https://get.docker.com | sh`
- Restart computer after installation

### 2. Get the Project
```bash
# Option A: Clone from GitHub
git clone https://github.com/emad313/discus.git
cd discus

# Option B: Copy folder from USB/network
# Just copy the entire 'discus' folder
```

### 3. Configure (Optional)
```bash
# If .env doesn't exist, create it:
cp .env.example .env

# Edit .env to change passwords (optional for development)
```

### 4. Start Everything
```bash
docker-compose up -d
```

### 5. Wait ~5-10 minutes
- First time: Downloads images + builds (10 min)
- Later: Uses cache (2 min)

### 6. Done! 🎉
- Open: http://localhost
- Backend: http://localhost:3000

---

## 🔍 Check Status

```bash
# See all services
docker-compose ps

# Should show 5 running containers:
# ✅ discus-frontend
# ✅ discus-backend
# ✅ discus-postgres
# ✅ discus-redis
# ✅ discus-coturn
```

---

## 📝 Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update after code changes
docker-compose up -d --build
```

---

## 🆘 Problems?

### Docker command not found
→ Install Docker Desktop and restart computer

### Port 80 already in use
→ Stop other web servers (IIS, Apache, etc.)

### Containers won't start
→ Check logs: `docker-compose logs backend`

### Need more help?
→ Read [SETUP_ON_NEW_PC.md](SETUP_ON_NEW_PC.md) for detailed troubleshooting

---

## ✅ Success Looks Like

```bash
$ docker-compose ps
NAME              STATUS
discus-backend    Up (healthy)
discus-frontend   Up (healthy)
discus-postgres   Up (healthy)
discus-redis      Up (healthy)
discus-coturn     Up
```

**Browser:** http://localhost shows Discus landing page

**Backend logs:** Shows "4 Mediasoup workers created"

---

**That's it! No Node.js, Python, or build tools needed. Docker does everything!**

For detailed documentation, see:
- [SETUP_ON_NEW_PC.md](SETUP_ON_NEW_PC.md) - Complete setup guide
- [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md) - What's running
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Technical details
