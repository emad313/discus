# 🚀 Quick Start Guide - Discus Video Conferencing

## ✅ Phase 1 Complete: Project Setup

Congratulations! The basic project structure is set up and both servers are running.

### 🎉 What's Done

- ✅ Project directory structure created
- ✅ Frontend (Vue 3 + Vite + Tailwind CSS) initialized
- ✅ Backend (Node.js + Express + Socket.io) initialized
- ✅ Basic routing and state management (Pinia)
- ✅ Environment configuration
- ✅ API routes for meetings
- ✅ Socket.io connection setup
- ✅ Mediasoup integration (needs native rebuild)

### 📋 Current Status

**Backend**: ✅ Running on http://localhost:3000
**Frontend**: ✅ Running on http://localhost:5173

### 🔧 Important Note: Mediasoup

Mediasoup requires native C++ dependencies to be built. Currently running without WebRTC support.

**To enable WebRTC (required for video calls):**

```bash
cd backend
npm rebuild mediasoup
```

*Note: This requires:*
- Python 3.x
- C++ Build Tools (Visual Studio Build Tools on Windows)
- Node-gyp

### 🌐 Access the Application

1. **Frontend**: http://localhost:5173
   - Home page with meeting creation
   - Join meeting page
   - Meeting room interface

2. **Backend API**: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Generate meeting: http://localhost:3000/api/meetings/generate
   - Validate meeting: http://localhost:3000/api/meetings/:id/validate

### 🧪 Test the Basic Setup

1. Open http://localhost:5173 in your browser
2. Click "New Meeting" - generates a random meeting ID
3. You'll be redirected to the join page
4. Enter your name and click "Join Now"
5. You'll enter the meeting room (WebRTC not yet functional)

### 📂 Project Structure

```
discus/
├── frontend/                  # Vue 3 Application
│   ├── src/
│   │   ├── views/            # Home, Meeting, JoinMeeting
│   │   ├── stores/           # Pinia stores (meeting, participants, media)
│   │   ├── router/           # Vue Router
│   │   └── main.js          # Entry point
│   └── package.json
│
├── backend/                   # Node.js Server
│   ├── src/
│   │   ├── config/           # Environment & Mediasoup config
│   │   ├── routes/           # API routes
│   │   ├── services/         # Mediasoup services
│   │   ├── socket/           # Socket.io handlers
│   │   ├── utils/            # Utilities
│   │   ├── app.js           # Express app
│   │   └── server.js        # Entry point
│   └── package.json
│
├── docs/                      # Documentation
├── PROJECT_ROADMAP.md        # Complete development plan
└── README.md                 # Project overview
```

### 🎯 Next Steps (Phase 2)

Now that the basic setup is complete, the next phase is:

**Phase 2: Core WebRTC Implementation (Week 3-5)**

1. **Fix Mediasoup Native Dependencies**
   - Install Visual Studio Build Tools
   - Rebuild Mediasoup

2. **Implement WebRTC Client**
   - Create `useWebRTC` composable
   - Integrate mediasoup-client
   - Handle media streams

3. **Test Basic Video Call**
   - Test with 2 users
   - Audio/video transmission
   - Basic controls

### 🛠️ Development Commands

**Frontend:**
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
```

**Backend:**
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

### 📦 Installed Dependencies

**Frontend:**
- vue: ^3.5.13
- vue-router: ^4.x
- pinia: Latest
- mediasoup-client: Latest
- socket.io-client: Latest
- tailwindcss: Latest

**Backend:**
- express: ^4.18.2
- socket.io: ^4.6.1
- mediasoup: ^3.13.0
- dotenv: ^16.3.1
- cors, helmet, uuid, etc.

### 🐛 Known Issues

1. **Mediasoup Not Working**: Native dependencies need to be built
   - Solution: `npm rebuild mediasoup` (requires build tools)

2. **WebRTC Not Functional**: Depends on Mediasoup being built
   - Will be addressed in Phase 2

3. **No Database Yet**: Using in-memory storage for meetings
   - PostgreSQL integration in later phases

### 📝 Environment Variables

**Frontend (.env):**
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: Socket.io server URL
- `VITE_STUN_URL`: STUN server

**Backend (.env):**
- `PORT`: Server port (3000)
- `CORS_ORIGIN`: Frontend URL
- `MEDIASOUP_*`: Mediasoup configuration
- Database and Redis (not yet used)

### 🎨 UI Features Implemented

- Beautiful landing page with gradient background
- Meeting creation with random ID generation
- Join meeting form with name input
- Meeting room layout with control bar
- Audio/video toggle buttons (UI only)
- Leave meeting functionality
- Responsive design

### 🔐 Security Notes

- CORS configured for development
- JWT secret should be changed in production
- HTTPS required for production WebRTC
- Meeting IDs are 10-character alphanumeric strings

### 📖 Documentation

- `PROJECT_ROADMAP.md`: Complete 12-week development plan
- `README.md`: Project overview and quick start
- `LICENSE`: MIT License

### 🤝 Contributing

The project is set up for contributions:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### 🆘 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port in .env
PORT=3001
```

**Frontend not connecting to backend:**
- Check CORS settings in backend
- Verify VITE_API_URL in frontend/.env
- Check browser console for errors

**Mediasoup build errors:**
- Install Python 3.x
- Install Visual Studio Build Tools
- Run `npm install --global node-gyp`

### 📊 Development Progress

**Week 1-2: Project Setup** ✅ COMPLETE
- [x] Directory structure
- [x] Frontend initialization
- [x] Backend initialization
- [x] Basic routing
- [x] Environment setup
- [x] API endpoints
- [ ] Docker configuration (pending)

**Week 3-5: Core WebRTC** 🔄 NEXT
- [ ] Mediasoup worker setup
- [ ] WebRTC client implementation
- [ ] Basic video call (2-4 users)
- [ ] Media controls

See `PROJECT_ROADMAP.md` for complete timeline.

### 🎓 Learning Resources

If you need to understand the technologies:
- Vue 3 Docs: https://vuejs.org/
- Mediasoup Docs: https://mediasoup.org/
- WebRTC Tutorial: https://webrtc.org/getting-started/
- Socket.io Docs: https://socket.io/

### 🚀 Ready for Next Phase!

The foundation is solid! Once Mediasoup is built, we can proceed with implementing the actual WebRTC video calling functionality.

**To continue development:**
1. Install C++ build tools
2. Rebuild Mediasoup: `cd backend && npm rebuild mediasoup`
3. Follow Phase 2 in PROJECT_ROADMAP.md

---

**Last Updated**: October 15, 2025  
**Phase**: 1 - Setup Complete ✅  
**Next**: Phase 2 - WebRTC Implementation
