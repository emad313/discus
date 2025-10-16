# 🎥 Discus - Open-Source Video Conferencing Platform

A Google Meet alternative built with Vue 3, Node.js, and Mediasoup. Supports 100+ concurrent participants without any third-party APIs.

---

## 📖 **NEW PC SETUP?**

Setting up on another computer for development?

- 🚀 **Quick Start:** [QUICK_SETUP.md](docs/QUICK_SETUP.md) - 5-minute guide
- 📋 **Detailed Guide:** [SETUP_ON_NEW_PC.md](docs/SETUP_ON_NEW_PC.md) - Complete instructions
- ✅ **Checklist:** [SETUP_CHECKLIST.md](docs/SETUP_CHECKLIST.md) - Print and follow
- 📚 **All Docs:** [INDEX.md](docs/INDEX.md) - Complete documentation index

**TL;DR:** Install Docker → Run `docker-compose up -d` → Done! ✨

---

## 🎉 Current Status (October 16, 2025)

**Phase 2 Complete:** Multi-user video calling is working! ✅

### Working Features
- ✅ Multi-user video calls (2+ participants)
- ✅ HD video quality (720p @ 30fps)
- ✅ Bidirectional audio streaming
- ✅ Screen sharing (getDisplayMedia)
- ✅ Camera on/off toggle
- ✅ Microphone mute/unmute
- ✅ No login required (guest access)
- ✅ Link-based meetings
- ✅ Responsive video grid
- ✅ Real-time WebRTC with Mediasoup SFU

### Coming Soon
- ⏳ Real-time chat (Phase 3)
- ⏳ Network access testing (192.168.1.104)
- ⏳ UI improvements (active speaker, pagination)
- ⏳ Recording (Phase 4)
- ⏳ Authentication system (Phase 4)
- ⏳ 100+ concurrent users testing (Phase 5)

## 🛠️ Tech Stack

### Frontend
- Vue 3 (Composition API)
- Vite
- Pinia (state management)
- Tailwind CSS
- mediasoup-client
- Socket.io-client

### Backend
- Node.js
- Express
- Mediasoup (SFU)
- Socket.io
- PostgreSQL
- Redis

### Infrastructure
- Docker & Docker Compose
- Nginx
- Coturn (TURN/STUN)

## 📋 Prerequisites

- Node.js 18+ ✅
- Python 3.x ✅
- **C++ Build Tools** ⚠️ **REQUIRED for video calls**
  - Windows: Visual Studio Build Tools
  - Linux: build-essential
  - Mac: Xcode Command Line Tools
- Git ✅
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 🖥️ **Setting Up On Another PC?**
**→ See [SETUP_ON_NEW_PC.md](docs/SETUP_ON_NEW_PC.md) for complete step-by-step guide**

---

### 🐳 **RECOMMENDED: Using Docker (100+ Users Ready)**

**Perfect for production and easy deployment anywhere!**

```bash
# 1. Install Docker (one-time setup)
# Windows/Mac: https://www.docker.com/products/docker-desktop/
# Linux: curl -fsSL https://get.docker.com | sh

# 2. Clone repository
git clone https://github.com/emad313/discus.git
cd discus

# 3. Configure environment
cp .env.example .env
# Edit .env and change passwords

# 4. Start everything (builds Mediasoup automatically!)
docker-compose up -d

# 5. Access application
# Frontend: http://localhost
# Backend: http://localhost:3000
```

**That's it!** 🎉 Docker handles:
- ✅ Mediasoup compilation (no build tools needed!)
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ TURN/STUN server
- ✅ Production-ready setup

**See [docs/QUICK_START_DOCKER.md](docs/QUICK_START_DOCKER.md) for detailed instructions.**

---

### 💻 Alternative: Local Development (No Docker)

**Only if you want to modify code directly:**

#### 1. Install Prerequisites
- Node.js 18+
- Python 3.x
- C++ Build Tools (Windows: VS Build Tools, Linux: build-essential, Mac: Xcode)

#### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm rebuild mediasoup  # Requires build tools!
npm run dev
```

**See [docs/INSTALL_MEDIASOUP.md](docs/INSTALL_MEDIASOUP.md) for build tools installation.**

## 📚 Documentation

- [Project Roadmap](PROJECT_ROADMAP.md) - Complete development plan
- [API Documentation](docs/API.md) - Backend API reference
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

## 🗺️ Development Status

**Current Phase**: Phase 1 - Project Setup & Infrastructure ✅ COMPLETE!

- [x] Project structure created
- [x] Documentation written
- [x] Frontend initialized (Vue 3 + Tailwind)
- [x] Backend initialized (Node.js + Mediasoup)
- [x] **Docker configuration for 100+ users** ✅
- [x] Database schema (PostgreSQL)
- [x] TURN/STUN server (Coturn)
- [ ] WebRTC implementation (Phase 2)

See [PROJECT_ROADMAP.md](docs/PROJECT_ROADMAP.md) for the complete timeline.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mediasoup](https://mediasoup.org/) - Powerful WebRTC SFU
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- Inspired by Google Meet and Jitsi Meet

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/emad313/discus/issues)
- Discussions: [Join discussions](https://github.com/emad313/discus/discussions)

---

Built with ❤️ by the community
