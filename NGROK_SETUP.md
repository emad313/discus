# ngrok Setup Guide for Remote Access

## The Problem
When accessing via ngrok, the frontend tries to connect to `localhost:3000` which doesn't exist on the remote device!

## Solution: Two ngrok Tunnels

You need **TWO** separate ngrok tunnels:
1. One for **frontend** (port 5173)
2. One for **backend** (port 3000)

---

## Step-by-Step Setup

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell or Git Bash):
```bash
cd D:/Emad/Development/discus/backend
npm start
```

✅ Keep this running! Backend is now on `http://localhost:3000`

---

### Step 2: Start Frontend Dev Server

Open **Terminal 2**:
```bash
cd D:/Emad/Development/discus/frontend
npm run dev
```

✅ Keep this running! Frontend is now on `http://localhost:5173`

---

### Step 3: Start ngrok for Backend

Open **Terminal 3**:
```bash
ngrok http 3000
```

**Copy the HTTPS URL** shown, for example:
```
Forwarding: https://abc-backend-xyz.ngrok-free.app -> http://localhost:3000
```

📋 **Save this URL!** You'll need it in Step 5.

✅ Keep this running!

---

### Step 4: Start ngrok for Frontend

Open **Terminal 4**:
```bash
ngrok http 5173
```

**Copy the HTTPS URL** shown, for example:
```
Forwarding: https://def-frontend-xyz.ngrok-free.app -> http://localhost:5173
```

📋 **Save this URL!** This is what you'll open in your phone.

✅ Keep this running!

---

### Step 5: Update Frontend Environment

Edit `frontend/.env` and replace with your **backend ngrok URL**:

```env
VITE_API_URL=https://abc-backend-xyz.ngrok-free.app/api
VITE_SOCKET_URL=https://abc-backend-xyz.ngrok-free.app
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_APP_NAME=Discus
VITE_MAX_PARTICIPANTS_VISIBLE=16
```

⚠️ **Important**: Use `https://` not `http://`!

---

### Step 6: Update Backend CORS

Edit `backend/.env` and add **both ngrok URLs**:

```env
CORS_ORIGIN=http://localhost,http://localhost:5173,https://abc-backend-xyz.ngrok-free.app,https://def-frontend-xyz.ngrok-free.app
```

---

### Step 7: Restart Everything

1. **Stop frontend** (Terminal 2): Press `Ctrl+C`
2. **Restart frontend**:
   ```bash
   npm run dev
   ```

3. **Stop backend** (Terminal 1): Press `Ctrl+C`
4. **Restart backend**:
   ```bash
   npm start
   ```

---

### Step 8: Test from Phone

1. Open Chrome on your phone
2. Go to: `https://def-frontend-xyz.ngrok-free.app` (your frontend ngrok URL)
3. **Click "Visit Site"** (ngrok warning page)
4. Should now load the app! 🎉

---

## Quick Reference

| Service | Local URL | ngrok URL (example) |
|---------|-----------|---------------------|
| Backend | http://localhost:3000 | https://abc-backend-xyz.ngrok-free.app |
| Frontend | http://localhost:5173 | https://def-frontend-xyz.ngrok-free.app |

---

## Troubleshooting

### Error: "Failed to fetch"
- ✅ Check backend is running (`npm start` in backend folder)
- ✅ Check `frontend/.env` has correct backend ngrok URL
- ✅ Check `backend/.env` CORS includes both ngrok URLs
- ✅ Restart both frontend and backend after changes

### Error: "WebSocket connection failed"
- ✅ Use HTTPS (not HTTP) in frontend .env
- ✅ Backend ngrok tunnel must be running
- ✅ Check Socket.IO is working: visit `https://your-backend-ngrok.app/socket.io/` (should return "ok")

### Camera/Mic Not Working
- ✅ Must use HTTPS (ngrok provides this)
- ✅ Check browser permissions
- ✅ Open Chrome DevTools on mobile: `chrome://inspect` on PC

### ngrok "Visit Site" Button
- This is normal! ngrok shows a warning page first
- Just click "Visit Site" to continue
- Consider upgrading ngrok to remove this page

---

## Alternative: Single ngrok Tunnel (Advanced)

If you want to use only ONE ngrok tunnel:

1. Build frontend for production:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve frontend from backend (add to backend):
   ```javascript
   app.use(express.static('../frontend/dist'))
   ```

3. Start only backend ngrok:
   ```bash
   ngrok http 3000
   ```

4. Access everything via backend ngrok URL

---

## Free ngrok Limitations

- ⚠️ **URLs change every restart** - update .env files each time
- ⚠️ **"Visit Site" warning page** on first access
- ⚠️ **Bandwidth limits** on free plan

### Solutions:
- **Upgrade ngrok**: Get permanent subdomain ($8/month)
- **Use Cloudflare Tunnel**: Free alternative to ngrok
- **Deploy to cloud**: Heroku, Railway, Render (permanent URLs)

---

## Production Deployment

For permanent production access, consider:

1. **Deploy backend**: Railway, Render, Heroku
2. **Deploy frontend**: Netlify, Vercel, Cloudflare Pages
3. **Get SSL certificate**: Let's Encrypt (free)
4. **Use custom domain**: Your own domain name

---

## Current Status

- ✅ Frontend .env updated to use `192.168.1.104:3000`
- ✅ Backend CORS includes ngrok URL
- ⏳ **Next**: Start both ngrok tunnels
- ⏳ **Next**: Update frontend .env with backend ngrok URL
- ⏳ **Next**: Restart servers and test

---

## Quick Start Commands

Copy and paste these:

### Terminal 1 - Backend
```bash
cd D:/Emad/Development/discus/backend && npm start
```

### Terminal 2 - Frontend
```bash
cd D:/Emad/Development/discus/frontend && npm run dev
```

### Terminal 3 - Backend ngrok
```bash
ngrok http 3000
```

### Terminal 4 - Frontend ngrok
```bash
ngrok http 5173
```

Then update `.env` files with the ngrok URLs shown! 🚀
