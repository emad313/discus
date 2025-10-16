# ✅ New PC Setup Checklist

Print this and follow along when setting up Discus on another computer.

---

## Before You Start

- [ ] Have USB drive or GitHub access to get project files
- [ ] Have admin/sudo access on the new PC
- [ ] Have stable internet connection (for Docker downloads)

---

## Installation Checklist

### Phase 1: Install Docker

- [ ] **Download Docker Desktop**
  - Windows/Mac: https://www.docker.com/products/docker-desktop/
  - Linux: Run `curl -fsSL https://get.docker.com | sh`

- [ ] **Install Docker Desktop**
  - Run installer
  - Accept defaults
  - Wait for installation to complete

- [ ] **Restart Computer**
  - Required for Docker to work properly

- [ ] **Verify Docker is installed**
  - Open terminal/command prompt
  - Run: `docker --version`
  - Should show: "Docker version 28.x.x" or similar

- [ ] **Verify Docker Compose is installed**
  - Run: `docker-compose --version`
  - Should show version number

---

### Phase 2: Get Project Files

#### Option A: From GitHub
- [ ] Open terminal
- [ ] Run: `git clone https://github.com/emad313/discus.git`
- [ ] Run: `cd discus`

#### Option B: From USB/Network
- [ ] Copy entire `discus` folder to your PC
- [ ] Make sure `.env` file is copied (hidden file!)
- [ ] Open terminal in the `discus` folder

---

### Phase 3: Configure Environment

- [ ] **Check if .env exists**
  - Windows: `dir .env`
  - Linux/Mac: `ls -la .env`

- [ ] **If .env doesn't exist, create it:**
  - Run: `cp .env.example .env`

- [ ] **Edit .env (optional for development)**
  - Change `PUBLIC_IP` if deploying to server
  - Change passwords if deploying to production
  - For local development, defaults are fine

---

### Phase 4: Build and Start

- [ ] **Build Docker images** (takes 5-10 minutes first time)
  - Run: `docker-compose build`
  - Wait for "Successfully built" messages
  - Don't worry about warnings about "version is obsolete"

- [ ] **Start all services**
  - Run: `docker-compose up -d`
  - Wait for "Running" status

- [ ] **Check all services are running**
  - Run: `docker-compose ps`
  - Should see 5 containers:
    - ✅ discus-frontend
    - ✅ discus-backend
    - ✅ discus-postgres
    - ✅ discus-redis
    - ✅ discus-coturn

---

### Phase 5: Verify Everything Works

- [ ] **Check backend logs**
  - Run: `docker-compose logs backend | grep Worker`
  - Should see: "Worker 0 created", "Worker 1 created", etc.
  - Should see: "Successfully created 4 workers"

- [ ] **Open browser**
  - Navigate to: http://localhost
  - Should see Discus landing page
  - No errors in browser console (F12)

- [ ] **Test backend API**
  - Navigate to: http://localhost:3000/health
  - Should see: `{"status":"ok","mediasoup":{"workers":4}}`

- [ ] **Check for errors**
  - Run: `docker-compose logs --tail=50`
  - Look for ERROR or FATAL messages
  - Some warnings are normal

---

## Troubleshooting Checklist

If something doesn't work:

- [ ] **Docker not starting?**
  - Restart Docker Desktop application
  - Wait for Docker Desktop to show "Running" status
  - Try again

- [ ] **Port 80 in use?**
  - Windows: Stop IIS or other web servers
  - Linux: `sudo systemctl stop apache2` or `sudo systemctl stop nginx`
  - Or change port in docker-compose.yml

- [ ] **Container won't start?**
  - Check logs: `docker-compose logs [service-name]`
  - Try restart: `docker-compose restart`
  - Try rebuild: `docker-compose up -d --build`

- [ ] **Still not working?**
  - Clear everything: `docker-compose down -v`
  - Clear Docker cache: `docker system prune -a`
  - Start fresh: `docker-compose up -d --build`

---

## Success Criteria

You're done when all these are true:

- [ ] `docker-compose ps` shows 5 services running
- [ ] http://localhost opens the Discus homepage
- [ ] Backend logs show "4 Mediasoup workers created"
- [ ] No ERROR messages in logs
- [ ] Can click "Create Meeting" button (even if video doesn't work yet)

---

## After Setup - Development Commands

Save these for later:

```bash
# View live logs
docker-compose logs -f

# Restart after code changes
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Stop everything
docker-compose down

# Stop and delete data
docker-compose down -v
```

---

## Time Estimates

- **Docker installation:** 5 minutes
- **Computer restart:** 2 minutes
- **Project download:** 1 minute
- **First build:** 10 minutes (downloads images, compiles Mediasoup)
- **Start services:** 1 minute
- **Verification:** 2 minutes

**Total time:** ~20 minutes

**Subsequent starts:** ~2 minutes (uses cached images)

---

## Files to Copy

When moving to another PC, make sure you copy:

- [ ] Entire `discus` folder
- [ ] `.env` file (hidden file!)
- [ ] `.dockerignore` file
- [ ] `.gitignore` file
- [ ] All subdirectories:
  - [ ] `backend/`
  - [ ] `frontend/`
  - [ ] `docker/`
  - [ ] `docs/`
  - [ ] `scripts/`

---

## Notes

- Docker compiles Mediasoup inside container = no build tools needed on your PC
- All services run in containers = clean, isolated, portable
- Same setup works on Windows, Mac, Linux
- One command to start everything: `docker-compose up -d`

---

**✅ Setup complete? Mark this checklist and keep it for reference!**

**Need help?** See [SETUP_ON_NEW_PC.md](SETUP_ON_NEW_PC.md) for detailed explanations.

---

Date: _____________  
Computer name: _____________  
Setup by: _____________  
Working: ☐ Yes  ☐ No (see troubleshooting)
