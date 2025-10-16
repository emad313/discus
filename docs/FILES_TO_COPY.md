# 📦 What to Copy to Another PC

**Complete list of files needed to run Discus on a new computer**

---

## ✅ Essential Files (Must Copy)

### 1. **Project Root Files**
```
discus/
├── .env                    ⚠️ IMPORTANT - Contains passwords
├── .env.example           ✅ Template for .env
├── .dockerignore          ✅ Docker build optimization
├── .gitignore             ✅ Git ignore rules
├── docker-compose.yml     ✅ CRITICAL - Docker configuration
├── package.json           ✅ Root package config
└── README.md              ✅ Project overview
```

### 2. **Backend Directory** (Complete folder)
```
backend/
├── src/                   ✅ All source code
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   └── server.js
├── package.json           ✅ Dependencies
├── package-lock.json      ✅ Lock file
└── .env.example           ✅ Backend env template
```

### 3. **Frontend Directory** (Complete folder)
```
frontend/
├── src/                   ✅ All source code
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── router/
│   ├── stores/
│   ├── views/
│   ├── App.vue
│   └── main.js
├── public/                ✅ Public assets
├── package.json           ✅ Dependencies
├── package-lock.json      ✅ Lock file
├── vite.config.js         ✅ Vite configuration
├── tailwind.config.js     ✅ Tailwind CSS
├── index.html             ✅ Entry point
└── .env.example           ✅ Frontend env template
```

### 4. **Docker Directory** (Complete folder)
```
docker/
├── backend/
│   └── Dockerfile         ✅ CRITICAL - Backend build
├── frontend/
│   ├── Dockerfile         ✅ CRITICAL - Frontend build
│   └── nginx.conf         ✅ Nginx configuration
├── postgres/
│   └── init.sql           ✅ Database schema
└── coturn/
    └── turnserver.conf    ✅ TURN/STUN config
```

### 5. **Documentation** (Complete folder)
```
docs/
├── DEPLOYMENT.md          ✅ Deployment guide
├── QUICK_START_DOCKER.md  ✅ Docker quick start
├── DO_I_NEED_NATIVE_DEPS.md
└── MEDIASOUP_NATIVE_DEPS.md
```

### 6. **Scripts** (Complete folder)
```
scripts/
├── deploy.sh              ✅ Linux/Mac deployment
├── deploy.bat             ✅ Windows deployment
└── dev-start.bat          ✅ Dev mode (no Docker)
```

### 7. **Project Documentation**
```
PROJECT_ROADMAP.md         ✅ 12-week development plan
PROJECT_STATUS.md          ✅ Complete project status
DEPLOYMENT_SUCCESS.md      ✅ Current deployment status
SETUP_ON_NEW_PC.md         ✅ New PC setup guide
QUICK_SETUP.md             ✅ 5-minute setup guide
SETUP_CHECKLIST.md         ✅ Printable checklist
```

---

## ⚠️ IMPORTANT: Hidden Files

Make sure to copy hidden files (start with `.`):

- ✅ `.env` - **CRITICAL** - Contains passwords and config
- ✅ `.dockerignore` - Docker build optimization
- ✅ `.gitignore` - Git configuration

**Windows:** Enable "Show hidden files" in File Explorer  
**Mac/Linux:** Use `ls -la` to see hidden files

---

## 🚫 Files You DON'T Need to Copy

These are generated automatically:

```
❌ backend/node_modules/      # Rebuilt by Docker
❌ frontend/node_modules/     # Rebuilt by Docker
❌ frontend/dist/             # Built by Docker
❌ .git/                      # Only if copying manually
❌ postgres-data/             # Docker volume
❌ redis-data/                # Docker volume
```

---

## 📦 Copy Methods

### Method 1: GitHub Clone (Recommended)
```bash
git clone https://github.com/emad313/discus.git
cd discus
```
✅ Automatically gets all files  
✅ Easy to update with `git pull`  
⚠️ Need to copy `.env` separately (not in Git)

### Method 2: ZIP File
1. Compress entire `discus` folder
2. Copy ZIP to new PC
3. Extract
4. Verify `.env` is present

### Method 3: USB Drive
1. Copy entire `discus` folder to USB
2. Paste on new PC
3. Verify all files copied (check hidden files!)

---

## ✅ Verification After Copy

Run these checks on the new PC:

```bash
# Check main files exist
ls -la                        # Should see .env, docker-compose.yml

# Check docker directory
ls docker/backend/            # Should see Dockerfile
ls docker/frontend/           # Should see Dockerfile, nginx.conf

# Check scripts
ls scripts/                   # Should see deploy.sh, deploy.bat

# Check backend
ls backend/src/               # Should see server.js, config/, routes/

# Check frontend  
ls frontend/src/              # Should see main.js, App.vue, views/

# Check .env exists
cat .env                      # Should show environment variables
```

---

## 📏 Expected Folder Size

| Folder | Size (Without node_modules) |
|--------|---------------------------|
| **backend/** | ~500 KB |
| **frontend/** | ~3 MB |
| **docker/** | ~20 KB |
| **docs/** | ~50 KB |
| **Total Project** | ~4 MB |

With Docker images built:
| Item | Size |
|------|------|
| **Backend Image** | ~1.5 GB |
| **Frontend Image** | ~50 MB |
| **PostgreSQL** | ~100 MB |
| **Redis** | ~30 MB |
| **Coturn** | ~40 MB |
| **Total Docker** | ~1.7 GB |

---

## 🔐 Security Notes

### Before Copying to Production Server:

1. **Change all passwords in .env:**
   - DB_PASSWORD
   - REDIS_PASSWORD
   - JWT_SECRET
   - TURN_PASSWORD

2. **Update PUBLIC_IP:**
   - Change from `127.0.0.1` to your server's IP

3. **Remove development files (optional):**
   - Can remove `docs/` folder
   - Can remove `scripts/` folder
   - Keep only what's needed

---

## 📋 Quick Copy Checklist

- [ ] Copy entire `discus` folder
- [ ] Verify `.env` file copied (hidden!)
- [ ] Verify `.dockerignore` copied (hidden!)
- [ ] Check `docker-compose.yml` exists
- [ ] Check `docker/` folder has Dockerfiles
- [ ] Check `backend/src/` has server.js
- [ ] Check `frontend/src/` has main.js
- [ ] Check `scripts/` has deploy scripts
- [ ] If using Git: Don't forget to copy `.env` separately!

---

## 🎯 After Copying

1. **Verify files:**
   ```bash
   cd discus
   ls -la
   ```

2. **Start with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Check it works:**
   - Open: http://localhost
   - Should see Discus homepage

---

## 📞 Need Help?

- **Setup guide:** [SETUP_ON_NEW_PC.md](SETUP_ON_NEW_PC.md)
- **Quick start:** [QUICK_SETUP.md](QUICK_SETUP.md)
- **Checklist:** [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Deployment:** [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md)

---

**✅ Got everything? Start with [QUICK_SETUP.md](QUICK_SETUP.md) to get running!**
