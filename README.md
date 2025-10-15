# 🎥 Discus - Open-Source Video Conferencing Platform

A Google Meet alternative built with Vue 3, Node.js, and Mediasoup. Supports 100+ concurrent participants without any third-party APIs.

## 🚀 Features

- ✅ 100+ participants per meeting
- ✅ HD video quality (720p)
- ✅ Screen sharing
- ✅ Real-time chat
- ✅ No login required (guest access)
- ✅ Link-based meetings
- ✅ Responsive design (mobile & desktop)
- ✅ Open-source & self-hosted

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

### 1. Clone the repository

```bash
git clone https://github.com/emad313/discus.git
cd discus
```

### 2. Install Native Dependencies (IMPORTANT!)

**For video calls to work, you MUST install C++ Build Tools:**

#### Windows:
```bash
# Run automated installer
./scripts/install-mediasoup.bat

# Or manually download:
# https://aka.ms/vs/17/release/vs_BuildTools.exe
# Select "Desktop development with C++"
```

#### Linux:
```bash
sudo apt-get install build-essential python3
```

#### Mac:
```bash
xcode-select --install
```

**See [docs/INSTALL_MEDIASOUP.md](docs/INSTALL_MEDIASOUP.md) for detailed instructions**

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Rebuild Mediasoup with native dependencies
npm rebuild mediasoup

npm run dev
```

### 5. Using Docker (Alternative)

```bash
docker-compose up -d
```

Access the application at `http://localhost:5173`

## 📚 Documentation

- [Project Roadmap](PROJECT_ROADMAP.md) - Complete development plan
- [API Documentation](docs/API.md) - Backend API reference
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

## 🗺️ Development Status

**Current Phase**: Phase 1 - Project Setup & Infrastructure

- [x] Project structure created
- [x] Documentation written
- [ ] Frontend initialized
- [ ] Backend initialized
- [ ] Docker configuration
- [ ] Basic WebRTC implementation

See [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for the complete timeline.

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
