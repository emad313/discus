# Mobile Browser Support Fix - October 18, 2025

## Issue
Mobile browsers (Chrome on Android/iOS) stuck on "Joining meeting... Setting up your audio and video" screen.

## Root Causes

### 1. **HTTPS Requirement** ⚠️
Mobile browsers **require HTTPS** for:
- `getUserMedia()` (camera/microphone access)
- WebRTC connections
- MediaDevices API

**Exception**: `localhost` works without HTTPS on desktop, but **not on mobile**.

### 2. **Audio/Video Constraints**
Mobile browsers don't support advanced audio constraints like:
- `sampleRate: 48000`
- `channelCount: 2`
- `sampleSize: 16`

These cause getUserMedia to fail silently or hang.

### 3. **Network Access**
Mobile phones on same WiFi network need:
- Correct IP address (not localhost)
- Open fireports
- CORS properly configured

---

## Fixes Applied

### Fix 1: Mobile-Friendly Media Constraints ✅

**File**: `frontend/src/composables/useMediaStream.js`

Added mobile detection and simplified constraints:

```javascript
// Detect if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// Mobile video constraints (simpler)
constraints.video = isMobile ? {
  facingMode: 'user',
  width: { ideal: 640 },
  height: { ideal: 480 },
} : {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
}

// Mobile audio constraints (no advanced features)
constraints.audio = isMobile ? {
  echoCancellation: true,
  noiseSuppression: true,
} : {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 2,
  sampleSize: 16,
}
```

### Fix 2: Timeout Protection ✅

**File**: `frontend/src/views/Meeting.vue`

Added timeouts to prevent infinite loading:

```javascript
// 30 second timeout for permissions
const permissionPromise = requestPermissions(initialVideo, initialAudio)
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Permission request timeout')), 30000)
)
await Promise.race([permissionPromise, timeoutPromise])

// 10 second timeout for WebRTC init
// 15 second timeout for join room
```

### Fix 3: Better Error Messages ✅

Added detailed logging:
- User agent detection
- HTTPS check
- Step-by-step progress
- Clear error messages

---

## Testing Mobile (Without HTTPS) 

### Option A: Using ngrok (Recommended) 🌐

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or use: npm install -g ngrok
   ```

2. **Start Frontend** (development):
   ```bash
   cd frontend
   npm run dev
   # Vite runs on port 5173
   ```

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 5173
   ```

4. **Copy HTTPS URL**:
   ```
   Forwarding: https://abcd-1234.ngrok-free.app -> http://localhost:5173
   ```

5. **Update Backend CORS** (add ngrok URL):
   ```env
   # backend/.env
   CORS_ORIGIN=http://localhost,https://abcd-1234.ngrok-free.app
   ```

6. **Access from mobile**:
   - Open Chrome on phone
   - Go to: `https://abcd-1234.ngrok-free.app`
   - Allow camera/microphone
   - Should work! ✅

### Option B: Local Network (No HTTPS - Limited) 📱

**⚠️ Warning**: May not work due to HTTPS requirement

1. **Find your PC IP**:
   ```bash
   ipconfig  # Windows
   # Look for: 192.168.1.xxx
   ```

2. **Update CORS** (backend/.env):
   ```env
   CORS_ORIGIN=http://192.168.1.104,http://192.168.1.104:5173
   ```

3. **Access from mobile**:
   - Connect phone to same WiFi
   - Open: `http://192.168.1.104:5173`
   - **Expected**: May fail on camera/mic permissions

### Option C: Self-Signed SSL (Advanced) 🔒

1. **Generate certificate**:
   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
     -keyout localhost-key.pem -out localhost-cert.pem \
     -days 365 -subj "/CN=192.168.1.104"
   ```

2. **Update vite.config.js**:
   ```javascript
   import fs from 'fs'
   
   export default {
     server: {
       https: {
         key: fs.readFileSync('./localhost-key.pem'),
         cert: fs.readFileSync('./localhost-cert.pem')
       },
       host: '0.0.0.0',
       port: 5173
     }
   }
   ```

3. **Access**: `https://192.168.1.104:5173`
   - Accept security warning on mobile
   - Should work! ✅

---

## Troubleshooting

### Stuck on "Joining meeting..."

**Check browser console** (mobile Chrome):
1. Connect mobile to PC via USB
2. On PC Chrome: `chrome://inspect`
3. Click "inspect" on your device
4. Check Console tab for errors

**Common errors**:
- `NotAllowedError`: User denied permissions → Ask again
- `NotFoundError`: No camera/mic → Check device settings
- `TypeError`: Constraints not supported → Fixed with our mobile detection
- `Connection timeout`: Backend not reachable → Check network/CORS

### Camera permission denied

**iOS Safari**:
- Settings → Safari → Camera → Allow

**Android Chrome**:
- Settings → Site Settings → Camera → Allow

### Backend not connecting

Check:
1. Backend running: `npm start` in backend folder
2. CORS includes mobile URL
3. Firewall allows port 3000
4. Phone on same network as PC

---

## Production Deployment (HTTPS Required)

For production, you **MUST** use HTTPS:

### Option 1: Cloudflare Tunnel (Free)
```bash
cloudflared tunnel --url http://localhost:3000
```

### Option 2: Let's Encrypt (Free SSL)
```bash
certbot --nginx -d yourdomain.com
```

### Option 3: Reverse Proxy (Nginx + SSL)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5173;
    }
}
```

---

## Summary of Changes

### Files Modified:
1. `frontend/src/composables/useMediaStream.js`
   - Mobile detection
   - Simplified constraints for mobile
   - Applied in `requestPermissions()` and `startLocalStream()`

2. `frontend/src/views/Meeting.vue`
   - Timeout protection (30s permissions, 10s init, 15s join)
   - Better error messages
   - User agent logging
   - HTTPS detection logging

### What's Fixed:
- ✅ Mobile browsers can now request camera/microphone
- ✅ Timeout prevents infinite "Joining meeting..." screen
- ✅ Better error messages show what's wrong
- ✅ Graceful fallback if media fails

### What Still Needs:
- ⚠️ **HTTPS for production** (use ngrok for testing)
- ⚠️ **TURN server** for different networks
- ⚠️ **Mobile UI optimization** (buttons, layout)

---

## Quick Test Checklist

- [ ] Desktop Chrome → Desktop Chrome (same PC) - Should work ✅
- [ ] Desktop Chrome → Mobile Chrome (ngrok HTTPS) - Should work ✅
- [ ] Mobile Chrome → Mobile Chrome (both on ngrok) - Should work ✅
- [ ] Check console for detailed logs
- [ ] Test with camera/mic off
- [ ] Test with different networks (WiFi → 4G)

---

## Need Help?

If still stuck, check:
1. Browser console (chrome://inspect for mobile)
2. Backend logs (npm start output)
3. Network tab (check failed requests)
4. Try ngrok with HTTPS
5. Test with camera/mic permissions disabled then re-enabled

**Mobile WebRTC requires HTTPS in production!** Use ngrok for testing. 🎯
