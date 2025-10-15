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

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/emad313/discus.git
cd discus
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Using Docker (Recommended)

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
