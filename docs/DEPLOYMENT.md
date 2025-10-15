# 🚀 Deploy Discus Anywhere - Complete Guide

## 🎯 This Guide Covers:
- ✅ Deploy on YOUR computer
- ✅ Deploy on ANY other computer
- ✅ Deploy on production servers
- ✅ Scale to 100+ concurrent users
- ✅ **Zero build tools needed** - everything in Docker!

---

## 📋 Prerequisites (One-Time Setup)

### What You Need:
1. **Docker** (free, works on Windows/Linux/Mac)
2. **Docker Compose** (included with Docker Desktop)
3. **Git** (to clone the project)

That's it! No C++ build tools, no Python, no Visual Studio. Just Docker.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Docker

**Windows:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Run installer
3. Restart computer
4. Verify: `docker --version`

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Mac:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and open
3. Verify: `docker --version`

### Step 2: Clone Repository

```bash
git clone https://github.com/emad313/discus.git
cd discus
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and change:
# - DB_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET
# - TURN_PASSWORD
# - PUBLIC_IP (your server's public IP)
```

**Important:** For production, generate strong passwords!

### Step 4: Start Everything

```bash
docker-compose up -d
```

That's it! 🎉

### Step 5: Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 📊 What Docker Does

When you run `docker-compose up`, it:

1. ✅ Builds Mediasoup with ALL native dependencies (inside container)
2. ✅ Sets up PostgreSQL database
3. ✅ Sets up Redis cache
4. ✅ Starts backend server with 4 Mediasoup workers
5. ✅ Builds and serves frontend with Nginx
6. ✅ Starts TURN/STUN server for NAT traversal
7. ✅ Configures networking between services

**You don't need to install ANYTHING except Docker!**

---

## 💻 Deploy on Another Computer

### Method 1: Using Git (Development)

On the new computer:

```bash
# 1. Install Docker (see above)

# 2. Clone repository
git clone https://github.com/emad313/discus.git
cd discus

# 3. Configure
cp .env.example .env
nano .env  # Update passwords and PUBLIC_IP

# 4. Start
docker-compose up -d

# 5. Check status
docker-compose ps
```

### Method 2: Using Docker Images (Production)

**Build images on your computer:**
```bash
# Build and tag images
docker-compose build
docker tag discus-backend:latest your-registry/discus-backend:latest
docker tag discus-frontend:latest your-registry/discus-frontend:latest

# Push to registry (Docker Hub or private registry)
docker push your-registry/discus-backend:latest
docker push your-registry/discus-frontend:latest
```

**Pull and run on another computer:**
```bash
# Pull images
docker pull your-registry/discus-backend:latest
docker pull your-registry/discus-frontend:latest

# Run with docker-compose
docker-compose up -d
```

### Method 3: Export/Import (Offline Transfer)

**On your computer:**
```bash
# Save images to file
docker save discus-backend:latest | gzip > discus-backend.tar.gz
docker save discus-frontend:latest | gzip > discus-frontend.tar.gz

# Copy files to USB/network drive
```

**On another computer:**
```bash
# Load images
docker load < discus-backend.tar.gz
docker load < discus-frontend.tar.gz

# Run
docker-compose up -d
```

---

## 🌐 Production Deployment

### Deploy on Cloud Server (AWS, DigitalOcean, etc.)

#### Option 1: Single Server (Up to 100 users)

**Server Requirements:**
- CPU: 4-8 cores
- RAM: 8-16 GB
- Disk: 50 GB SSD
- Bandwidth: 500 Mbps - 1 Gbps
- OS: Ubuntu 22.04 LTS

**Deployment Steps:**

```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Install Docker Compose
apt-get update
apt-get install docker-compose-plugin

# 4. Clone repository
git clone https://github.com/emad313/discus.git
cd discus

# 5. Configure environment
cp .env.example .env
nano .env

# Update these:
NODE_ENV=production
PUBLIC_IP=your-server-public-ip
DB_PASSWORD=strong_random_password
REDIS_PASSWORD=strong_random_password
JWT_SECRET=very_long_random_string_min_32_chars
TURN_PASSWORD=strong_random_password

# 6. Start services
docker-compose up -d

# 7. Setup firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3478/tcp
ufw allow 3478/udp
ufw allow 5349/tcp
ufw allow 10000:10100/tcp
ufw allow 10000:10100/udp
ufw enable

# 8. Setup SSL (recommended)
apt-get install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

#### Option 2: Multiple Servers (Scale Beyond 100 users)

**Architecture:**
```
Load Balancer
    ↓
Frontend Servers (Nginx) × 2
    ↓
Backend Servers (Mediasoup) × 3
    ↓
Database Cluster (PostgreSQL)
    ↓
Redis Cluster
```

**Use Docker Swarm or Kubernetes** for orchestration.

---

## 🔧 Docker Commands Reference

### Starting/Stopping

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Scaling

```bash
# Scale backend workers (for more users)
docker-compose up -d --scale backend=3

# Scale with more resources
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

### Maintenance

```bash
# Update application
git pull
docker-compose build
docker-compose up -d

# Clean up old images/containers
docker system prune -a

# Backup database
docker exec discus-postgres pg_dump -U discus discus > backup.sql

# Restore database
docker exec -i discus-postgres psql -U discus discus < backup.sql

# View resource usage
docker stats
```

### Troubleshooting

```bash
# Check service status
docker-compose ps

# Check container logs
docker logs discus-backend
docker logs discus-frontend

# Enter container shell
docker exec -it discus-backend sh
docker exec -it discus-postgres psql -U discus

# Check network
docker network ls
docker network inspect discus_discus-network

# Test connectivity
docker exec discus-backend ping postgres
docker exec discus-backend ping redis
```

---

## 📈 Performance Optimization for 100+ Users

### 1. Increase Docker Resources

Edit `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '8'      # Increase for more users
        memory: 8G     # Increase for more users
      reservations:
        cpus: '4'
        memory: 4G
```

### 2. Optimize Mediasoup Workers

In `backend/.env`:
```bash
# Number of Mediasoup workers (1 per CPU core)
MEDIASOUP_NUM_WORKERS=8

# Port range (100 ports per worker)
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10800
```

### 3. Enable Redis Clustering

For 500+ concurrent users, use Redis Cluster:
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --cluster-enabled yes
```

### 4. Database Connection Pooling

In backend code, increase pool size:
```javascript
const pool = {
  max: 100,  // Max connections
  min: 10,   // Min connections
  idle: 30000
}
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Change all default passwords in `.env`
- [ ] Enable firewall (ufw or iptables)
- [ ] Setup SSL certificates (Let's Encrypt)
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Setup rate limiting
- [ ] Enable Docker secret management
- [ ] Regular backups (database + volumes)
- [ ] Monitor logs for suspicious activity
- [ ] Update Docker images regularly

---

## 📊 Monitoring

### Health Checks

```bash
# Check all services
curl http://localhost:3000/health

# Check frontend
curl http://localhost/health

# Check database
docker exec discus-postgres pg_isready -U discus

# Check Redis
docker exec discus-redis redis-cli ping
```

### Metrics

Add monitoring tools:

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```

---

## 🆘 Troubleshooting

### Issue: Mediasoup Won't Start

**Solution:**
```bash
# Check if ports are available
docker-compose logs backend | grep "Worker"

# Ensure port range is open
ufw allow 10000:10100/udp
```

### Issue: Can't Connect to Database

**Solution:**
```bash
# Check database logs
docker-compose logs postgres

# Verify connection
docker exec discus-backend psql postgresql://discus:password@postgres:5432/discus
```

### Issue: Frontend Can't Reach Backend

**Solution:**
```bash
# Check network
docker network inspect discus_discus-network

# Verify backend is running
curl http://localhost:3000/health

# Check nginx config
docker exec discus-frontend cat /etc/nginx/conf.d/default.conf
```

### Issue: Poor Video Quality

**Solution:**
1. Check bandwidth: `docker stats`
2. Increase worker count
3. Enable simulcast in mediasoup config
4. Check TURN server logs

---

## 📦 Backup & Restore

### Backup

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec discus-postgres pg_dump -U discus discus > backup_db_$DATE.sql

# Backup volumes
docker run --rm -v discus_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup_postgres_$DATE.tar.gz /data

docker run --rm -v discus_redis-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup_redis_$DATE.tar.gz /data
```

### Restore

```bash
# Restore database
docker exec -i discus-postgres psql -U discus discus < backup_db_YYYYMMDD.sql

# Restore volumes
docker run --rm -v discus_postgres-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/backup_postgres_YYYYMMDD.tar.gz -C /
```

---

## 🚀 Zero-Downtime Updates

```bash
# 1. Build new images
docker-compose build

# 2. Tag as 'next'
docker tag discus-backend:latest discus-backend:next

# 3. Update one service at a time
docker-compose up -d --no-deps --build backend

# 4. Wait and verify
sleep 10
curl http://localhost:3000/health

# 5. Update frontend
docker-compose up -d --no-deps --build frontend
```

---

## 📖 Summary

### Deploy Locally:
```bash
docker-compose up -d
```

### Deploy on Another Computer:
```bash
git clone https://github.com/emad313/discus.git
cd discus
cp .env.example .env
nano .env  # Update values
docker-compose up -d
```

### Deploy on Production:
```bash
ssh root@server
git clone https://github.com/emad313/discus.git
cd discus
cp .env.example .env
nano .env  # Update for production
docker-compose up -d
```

**That's it! Docker handles everything!** 🎉

---

## 🎓 Next Steps

1. **Test deployment locally** - Make sure everything works
2. **Deploy to staging server** - Test with real network
3. **Setup monitoring** - Track performance
4. **Load test** - Verify 100+ user capacity
5. **Deploy to production** - Go live!

---

**Questions? Issues? Check logs:**
```bash
docker-compose logs -f
```

Everything is logged and easy to debug! 🚀
