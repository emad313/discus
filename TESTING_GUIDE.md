# Quick Testing Guide - Video Calls

## 🚀 Test Your Video Call Implementation

### Method 1: Two Browser Windows (Same Computer)

1. **Open First Browser Window**
   ```
   URL: http://localhost
   ```
   - Click "New Meeting"
   - Allow camera and microphone permissions
   - Copy the meeting URL (e.g., `http://localhost/meeting/abc123?name=User1`)

2. **Open Second Browser Window**
   - Open a NEW incognito/private window (to simulate different user)
   - Paste the meeting URL
   - Change `name=User1` to `name=User2`
   - Press Enter
   - Allow camera and microphone permissions

3. **Expected Result**
   - Window 1: Should see YOUR video + User2's video
   - Window 2: Should see YOUR video + User1's video
   - Total: 2 videos in each window

### Method 2: Different Browsers (Same Computer)

1. **Chrome Browser**
   ```
   http://localhost
   ```
   - Create new meeting
   - Copy URL

2. **Firefox/Edge Browser**
   - Paste URL
   - Join meeting
   - Should see both videos

### Method 3: Different Devices (Most Realistic)

1. **Your Computer**
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
   - Example: `192.168.1.100`
   - Open: `http://192.168.1.100`
   - Create meeting

2. **Your Phone/Tablet**
   - Connect to same WiFi network
   - Open: `http://192.168.1.100`
   - Join the meeting
   - Should see both videos

## ✅ What to Test

### Basic Functionality
- [ ] Camera shows your face
- [ ] Microphone icon shows when unmuted
- [ ] Remote participant video appears
- [ ] Remote participant name displays
- [ ] Participant counter updates (1 → 2)

### Controls
- [ ] Click microphone button → Video shows muted icon
- [ ] Click microphone again → Unmuted
- [ ] Click camera button → Your video disappears (shows placeholder)
- [ ] Click camera again → Video reappears
- [ ] Click screen share → Screen picker appears
- [ ] Select screen → Screen sharing works
- [ ] Click Leave → Returns to home page

### Quality
- [ ] Video is smooth (not laggy)
- [ ] Audio is clear (no echo/static)
- [ ] Video syncs with audio (no delay)
- [ ] Multiple videos load quickly

## 🔍 Check Browser Console

Open Developer Tools (F12) and check for:

### ✅ Good Signs
```
[Media] Permissions granted: { camera: true, microphone: true }
[Media] Local stream started: { video: true, audio: true }
[WebRTC] Connected to signaling server
[WebRTC] Device loaded with RTP capabilities
[WebRTC] Joined room: <meeting-id>
[WebRTC] Send transport created
[WebRTC] Recv transport created
[WebRTC] Producing video track
[WebRTC] Producing audio track
[WebRTC] New producer received: <producer-id>
[WebRTC] Consuming media: <producer-id>
```

### ❌ Bad Signs (Need Fixing)
```
Permission denied
Device not found
Failed to connect
Transport failed
Consumer closed unexpectedly
```

## 🐛 Common Issues & Fixes

### Issue 1: Permission Denied
**Symptom**: No video/audio, permission error
**Fix**:
1. Check browser settings (chrome://settings/content/camera)
2. Reload page
3. Make sure HTTPS or localhost

### Issue 2: Black Video
**Symptom**: Video element is black
**Fix**:
1. Check if stream is attached: `console.log(localVideoRef.value.srcObject)`
2. Verify video element has `autoplay playsinline muted`
3. Check CSS (video might be hidden)

### Issue 3: No Remote Video
**Symptom**: Can see yourself but not other user
**Fix**:
1. Check backend logs: `docker-compose logs backend`
2. Verify Socket.io connection in Network tab (ws://localhost:3000)
3. Check if both users are in same meeting ID
4. Check console for "New producer received"

### Issue 4: Connection Failed
**Symptom**: "Failed to join meeting" error
**Fix**:
1. Check if backend is running: `docker-compose ps`
2. Verify backend health: `curl http://localhost:3000/health`
3. Check Mediasoup workers: `docker-compose logs backend | grep "Worker"`
4. Restart containers: `docker-compose restart`

### Issue 5: Video Freezes
**Symptom**: Video starts but then freezes
**Fix**:
1. Check network connection
2. Monitor CPU usage (video encoding is heavy)
3. Lower video quality in useMediaStream.js (720p → 360p)
4. Check for console errors

## 📊 Performance Check

### Browser Task Manager
**Chrome**: Shift + Esc → Check "Discus" tabs

**Expected Usage (2 users)**:
- CPU: 10-30%
- Memory: 100-300 MB
- Network: 1-3 Mbps

**Warning Signs**:
- CPU > 50% → May need optimization
- Memory > 500 MB → Possible memory leak
- Network > 5 Mbps → Bitrate too high

### Server Resources
```bash
# Check backend container
docker stats discus-backend

# Expected (2 users):
CPU: < 5%
MEM: < 500 MB
NET I/O: 2-5 Mbps
```

## 🎯 Success Criteria

You've successfully implemented Phase 2 if:

✅ Local video shows your camera  
✅ Remote video shows other participant  
✅ Mute/unmute works  
✅ Camera on/off works  
✅ Screen sharing works  
✅ No console errors  
✅ Smooth video (no lag)  
✅ Clear audio (no echo)  
✅ Multiple users can join  
✅ Leave button returns to home  

## 📱 Mobile Testing

### iOS (Safari)
1. Connect iPhone to same WiFi
2. Open Safari
3. Go to `http://192.168.1.100` (your computer's IP)
4. Allow camera/microphone
5. Join meeting

**Note**: iOS requires HTTPS for getUserMedia() in production. Localhost works for testing.

### Android (Chrome)
1. Connect Android to same WiFi
2. Open Chrome
3. Go to `http://192.168.1.100`
4. Allow permissions
5. Join meeting

## 🔐 Security Notes

### Current Setup (Development)
- HTTP (not encrypted)
- No authentication
- Anyone with meeting ID can join
- Works on localhost and local network

### Production Requirements
- HTTPS (Let's Encrypt certificate)
- User authentication (JWT)
- Meeting passwords/waiting room
- TURN server for NAT traversal
- Rate limiting

## Next Steps After Testing

1. ✅ Verify video calls work with 2+ users
2. ✅ Test all controls (mute/unmute/screen share)
3. ✅ Check for console errors
4. ✅ Commit to Git
5. → Proceed to Phase 3 (Chat System)

## 🆘 Need Help?

### Check Documentation
- `PHASE2_WEBRTC_COMPLETE.md` - Implementation details
- `PROJECT_STATUS.md` - Overall project status
- Backend logs: `docker-compose logs backend`
- Frontend logs: Browser console (F12)

### Restart Everything
```bash
cd /e/Emad/Projects/discus
docker-compose down
docker-compose up -d
```

### Reset Database
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
```

---

**Ready to test?** Open two browser windows and start a video call! 🎥
