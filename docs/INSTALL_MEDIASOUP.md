# 🔧 Installing Mediasoup Native Dependencies

## Why Do We Need This?

Mediasoup is a **high-performance WebRTC SFU (Selective Forwarding Unit)** written in **C++**. It's the core technology that enables 100+ participants in a video call. Node.js needs to compile this C++ code, which requires:

1. ✅ **Python 3.x** - For build scripts (You have Python 3.13)
2. ❌ **C++ Compiler** - To compile native C++ code (Missing)
3. ❌ **node-gyp** - Node.js native addon build tool (Will install)

---

## 🪟 Windows Installation (Your System)

### Option 1: Install Visual Studio Build Tools (Recommended)

**This is the official Microsoft C++ compiler toolchain.**

#### Step 1: Download Visual Studio Build Tools

Visit: https://visualstudio.microsoft.com/downloads/

Or direct link: https://aka.ms/vs/17/release/vs_BuildTools.exe

#### Step 2: Run the Installer

1. Run `vs_BuildTools.exe`
2. Select **"Desktop development with C++"**
3. On the right panel, ensure these are checked:
   - ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools
   - ✅ Windows 10/11 SDK
   - ✅ C++ CMake tools for Windows
4. Click **Install** (requires ~7 GB disk space)
5. **Restart your computer** after installation

#### Step 3: Verify Installation

Open a **new terminal** and run:
```bash
where cl.exe
```

Should output something like:
```
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.XX.XXXXX\bin\Hostx64\x64\cl.exe
```

---

### Option 2: Install via Chocolatey (Faster)

If you have Chocolatey package manager:

```bash
# Run as Administrator
choco install visualstudio2022buildtools
choco install visualstudio2022-workload-vctools
```

---

### Option 3: Use Windows Build Tools (Older Method)

```bash
# Run as Administrator
npm install --global windows-build-tools
```

**Note**: This is deprecated but might work.

---

## 🔨 Install node-gyp Globally

After installing C++ Build Tools:

```bash
npm install --global node-gyp
```

---

## 🚀 Build Mediasoup

Once you have the build tools installed:

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Clean and Rebuild

```bash
# Remove old build artifacts
npm uninstall mediasoup
rm -rf node_modules/mediasoup

# Reinstall with native compilation
npm install mediasoup

# Or if already installed, rebuild
npm rebuild mediasoup
```

### Step 3: Verify Build

You should see output like:
```
> mediasoup@3.13.0 install
> npm run worker:build

Building mediasoup C++ worker...
[lots of compilation messages]
✓ mediasoup worker built successfully
```

---

## ✅ Verify Everything Works

### Test 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
[INFO] Initializing Mediasoup workers...
[INFO] Creating 4 Mediasoup workers...
[INFO] Worker 0 created [pid:XXXX]
[INFO] Worker 1 created [pid:XXXX]
[INFO] Worker 2 created [pid:XXXX]
[INFO] Worker 3 created [pid:XXXX]
[INFO] Successfully created 4 workers
[INFO] Mediasoup workers initialized successfully
[INFO] 🚀 Server running on http://localhost:3000
```

### Test 2: Check Health Endpoint

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T10:40:00.000Z",
  "uptime": 5.123
}
```

---

## 🐧 Linux Installation (Reference)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential python3 python3-pip

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3

# Then install mediasoup
cd backend
npm rebuild mediasoup
```

---

## 🍎 macOS Installation (Reference)

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or install full Xcode from App Store

# Then install mediasoup
cd backend
npm rebuild mediasoup
```

---

## 🔍 Troubleshooting

### Error: "MSBuild not found"

**Solution**: Make sure Visual Studio Build Tools are installed and restart your terminal.

### Error: "Python not found"

**Solution**: 
```bash
# Tell npm where Python is
npm config set python "C:\Python313\python.exe"
```

### Error: "node-gyp rebuild failed"

**Solution**:
```bash
# Clean npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

### Error: "Permission denied"

**Solution**: Run terminal as **Administrator** on Windows.

### Error: "Invalid version" or "Cannot find module"

**Solution**:
```bash
# Update npm to latest
npm install -g npm@latest

# Update Node.js to LTS version (18.x or 20.x)
```

---

## 🎯 Quick Installation Script (Windows)

Save this as `install-build-tools.ps1` and run in **PowerShell as Administrator**:

```powershell
# Install Chocolatey if not installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Visual Studio Build Tools
choco install visualstudio2022buildtools -y
choco install visualstudio2022-workload-vctools -y

# Install node-gyp
npm install -g node-gyp

Write-Host "Installation complete! Please restart your computer."
```

Run:
```powershell
powershell -ExecutionPolicy Bypass -File install-build-tools.ps1
```

---

## 📊 What Gets Installed?

### Visual Studio Build Tools (~7 GB)
- Microsoft C++ Compiler (MSVC)
- Windows SDK
- CMake build tools
- MSBuild

### Why So Large?
Mediasoup is a complex C++ application that needs:
- C++17 compiler
- libuv (async I/O)
- OpenSSL (encryption)
- libsrtp (media encryption)
- usrsctp (data channels)

All of these get compiled from source when you install mediasoup.

---

## ⚡ Performance After Installation

Once built, Mediasoup provides:
- **Low latency**: < 50ms media routing
- **High throughput**: 100+ concurrent streams
- **CPU efficient**: C++ optimized routing
- **Memory efficient**: Minimal overhead per stream

---

## 🆘 Still Having Issues?

### Option A: Use Pre-built Binaries (If Available)

Some systems can use pre-compiled binaries:
```bash
npm install mediasoup --build-from-source=false
```

### Option B: Use Docker (Skip Native Build)

We can set up Docker which comes with build tools pre-installed:
```bash
docker-compose up
```

### Option C: Use Alternative (Not Recommended)

- **simple-peer**: Easy but doesn't scale beyond 8 users
- **PeerJS**: Good for small groups, mesh topology
- **Janus Gateway**: Alternative SFU, more complex

**But none match Mediasoup's performance for 100+ users.**

---

## 📝 Next Steps After Installation

1. ✅ Install Visual Studio Build Tools (see above)
2. ✅ Restart your computer
3. ✅ Run `npm rebuild mediasoup` in backend folder
4. ✅ Start backend server: `npm run dev`
5. ✅ Verify workers are created (check logs)
6. ✅ Continue to Phase 2: WebRTC Implementation

---

## 💡 Pro Tips

1. **Use WSL2**: If on Windows 11, use Windows Subsystem for Linux for easier builds
2. **Docker**: For production, use Docker to avoid dependency issues
3. **CI/CD**: In CI pipelines, use pre-built containers with build tools
4. **Cloud**: Cloud platforms (AWS, DigitalOcean) have pre-configured images

---

## 🎓 Understanding the Build Process

When you run `npm install mediasoup`:

```
1. Downloads mediasoup npm package
2. Runs postinstall script: npm run worker:build
3. Compiles C++ worker using:
   - CMake (build system)
   - MSVC or GCC (compiler)
   - Python (build scripts)
4. Creates worker binary: build/Release/mediasoup-worker.exe
5. Node.js communicates with this binary via IPC
```

That's why we need all these build tools!

---

**Ready to install?** Follow the steps above and let me know if you encounter any issues!
