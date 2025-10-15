# 🚀 QUICK START - Discus Video Conferencing (100+ Users)

## ⚡ 3-Step Deployment (ANY Computer)

### Step 1: Install Docker
**Windows/Mac**: Download https://www.docker.com/products/docker-desktop/  
**Linux**: `curl -fsSL https://get.docker.com | sh`

### Step 2: Clone & Configure
```bash
git clone https://github.com/emad313/discus.git
cd discus
cp .env.example .env
# Edit .env and change passwords
```

### Step 3: Start
```bash
docker-compose up -d
```

✅ **Done!** Access at http://localhost

---

## 🌍 Deploy on Production Server

```bash
# SSH to server
ssh root@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone & setup
git clone https://github.com/emad313/discus.git
cd discus
cp .env.example .env
nano .env  # Update PUBLIC_IP and passwords

# Start
docker-compose up -d

# Open firewall
ufw allow 80,443,3000,3478,10000:10100/tcp
ufw allow 3478,10000:10100/udp
```

✅ **Live at**: http://your-server-ip

---

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# Update
git pull && docker-compose up -d --build

# Backup database
docker exec discus-postgres pg_dump -U discus > backup.sql
```

---

## 📊 Scaling for More Users

Edit `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '8'    # More CPUs = more users
        memory: 16G  # More RAM = more users
```

Update `.env`:
```bash
MEDIASOUP_NUM_WORKERS=8  # 1 per CPU core
```

---

## ⚙️ What's Inside?

- **Backend**: Node.js + Mediasoup SFU (100+ users)
- **Frontend**: Vue 3 + Tailwind CSS
- **Database**: PostgreSQL
- **Cache**: Redis
- **TURN/STUN**: Coturn (NAT traversal)
- **All dependencies**: Built inside Docker (no local install!)

---

## 🎯 Key Features

✅ 100+ concurrent participants  
✅ HD video (720p @ 30fps)  
✅ Screen sharing  
✅ Real-time chat  
✅ No login required (guest access)  
✅ Works on any device/browser  
✅ Self-hosted (no recurring costs)  

---

## 📖 Full Documentation

- **Deployment Guide**: [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Project Roadmap**: [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md)
- **Docker Details**: [DO_I_NEED_NATIVE_DEPS.md](DO_I_NEED_NATIVE_DEPS.md)

---

## 🆘 Troubleshooting

**Can't access?**
```bash
docker-compose ps  # Check if all services are running
docker-compose logs backend  # Check logs
```

**Video not working?**
- Update PUBLIC_IP in .env
- Check firewall allows UDP ports 10000-10100
- Check TURN server logs: `docker logs discus-coturn`

**Database errors?**
```bash
docker-compose logs postgres
docker exec -it discus-postgres psql -U discus
```

---

**That's it! Docker does all the heavy lifting!** 🎉

No build tools. No native dependencies. Just Docker. 🚀
