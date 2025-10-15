# 🚀 Quick Setup - Native Dependencies

## Current Status

✅ **Python 3.13** - Installed  
✅ **node-gyp** - Installed  
❌ **C++ Build Tools** - **REQUIRED** for Mediasoup

---

## 🎯 What You Need to Do

### Windows (Your System)

**You MUST install Visual Studio Build Tools to use Mediasoup:**

#### Option 1: Automated Script (Recommended)

Run from project root:
```bash
./scripts/install-mediasoup.bat
```

This will:
1. ✅ Install node-gyp (already done)
2. Guide you to download Visual Studio Build Tools
3. Rebuild Mediasoup after installation

#### Option 2: Manual Installation

1. **Download Visual Studio Build Tools**  
   https://aka.ms/vs/17/release/vs_BuildTools.exe

2. **Run installer and select:**
   - ✅ Desktop development with C++
   - ✅ MSVC v143 compiler
   - ✅ Windows 10/11 SDK

3. **Install** (requires ~7 GB, takes 10-20 minutes)

4. **RESTART YOUR COMPUTER** (important!)

5. **Rebuild Mediasoup:**
   ```bash
   cd backend
   npm rebuild mediasoup
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

---

## ⚡ Why Is This Needed?

Mediasoup is a **C++ application** that provides:
- High-performance video routing for 100+ users
- Low latency (< 50ms)
- Efficient CPU usage
- Industry-standard WebRTC SFU

It needs to be compiled from C++ source code, which requires a C++ compiler.

---

## 🔄 Alternative: Skip for Now

If you want to continue development without WebRTC:

**The app will work without Mediasoup for:**
- ✅ UI development
- ✅ API testing
- ✅ Socket.io messaging
- ✅ State management
- ❌ Video/audio calls (requires Mediasoup)

The server will start with this warning:
```
[WARN] Mediasoup initialization failed
[INFO] Server will continue without WebRTC support
```

---

## 📚 Complete Guide

See **[docs/INSTALL_MEDIASOUP.md](../docs/INSTALL_MEDIASOUP.md)** for:
- Detailed installation steps
- Troubleshooting guide
- Linux/Mac instructions
- Docker alternative

---

## ✅ Verify Installation

After installing Build Tools and restarting:

```bash
# Check if compiler is available
where cl.exe

# Should output path to compiler

# Rebuild Mediasoup
cd backend
npm rebuild mediasoup

# Start server
npm run dev

# Should see:
# [INFO] Worker 0 created [pid:XXXX]
# [INFO] Worker 1 created [pid:XXXX]
# [INFO] Mediasoup workers initialized successfully
```

---

## 🆘 Need Help?

1. Check [docs/INSTALL_MEDIASOUP.md](../docs/INSTALL_MEDIASOUP.md) for troubleshooting
2. Run the automated script: `./scripts/install-mediasoup.bat`
3. Or open an issue on GitHub

---

**Estimated Time:** 20-30 minutes (mostly waiting for download/install)  
**Disk Space:** ~7 GB for Build Tools  
**Required:** Administrator privileges
