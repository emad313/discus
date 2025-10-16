# Pre-Join Screen Testing Guide

## 🎯 New Onboarding Flow Implemented!

### What's New
- ✅ Pre-join screen before entering meeting
- ✅ Camera/microphone preview
- ✅ Device selection (camera, mic, speakers)
- ✅ Name customization
- ✅ See who's already in the meeting
- ✅ Real-time participant updates
- ✅ Toggle audio/video before joining

---

## 🚀 Testing the New Flow

### Test 1: Create New Meeting

```bash
1. Go to http://localhost
2. Click "New meeting" button
   ✅ Should redirect to /prejoin/{meeting-id}
3. Pre-join screen should show:
   ✅ Your video preview (or avatar if no camera)
   ✅ Name input field (empty or from localStorage)
   ✅ Camera dropdown (if camera available)
   ✅ Microphone dropdown  
   ✅ Speaker dropdown
   ✅ Audio/Video toggle buttons
   ✅ "In this meeting" panel (shows 0 people)
4. Enter your name (e.g., "Alice")
5. Toggle video/audio to test
6. Click "Join Now"
   ✅ Should redirect to /meeting/{meeting-id}
   ✅ Should enter with selected settings
```

### Test 2: Join Existing Meeting

**Window 1 (Create Meeting)**:
```bash
1. Open http://localhost
2. Click "New meeting"
3. Enter name: "Alice"
4. Click "Join Now"
5. You're now in the meeting
```

**Window 2 (Join Existing Meeting)**:
```bash
1. Open http://localhost in incognito/different browser
2. Enter meeting ID from Window 1
3. Click "Join"
   ✅ Should redirect to /prejoin/{meeting-id}
4. Pre-join screen shows:
   ✅ "In this meeting" panel shows "1 person already here"
   ✅ Alice's name with mic/camera status
   ✅ Green connection dot
5. Enter your name: "Bob"
6. Adjust your settings
7. Click "Join Now"
   ✅ Both windows now show "2 participants"
```

### Test 3: Real-Time Participant Updates

**Setup**: Have two browsers in pre-join and one in meeting

**Window 1**: Pre-join screen (Alice)
**Window 2**: Pre-join screen (Bob)  
**Window 3**: Meeting room (Charlie - already joined)

```bash
1. Window 1 (Alice) on pre-join screen
   ✅ Should see "1 person already here" (Charlie)

2. Window 2 (Bob) clicks "Join Now"
   ✅ Window 1 should update to "2 people already here"
   ✅ Should show both Charlie and Bob in list
   
3. Window 3 (Charlie) leaves meeting
   ✅ Window 1 should update to "1 person already here" (only Bob)
```

### Test 4: Device Selection

```bash
1. Go to pre-join screen
2. If you have multiple cameras/mics:
   ✅ Select different camera from dropdown
   ✅ Video preview should update immediately
   ✅ Select different microphone
   ✅ Audio should switch (test by speaking)
3. Toggle video off:
   ✅ Video preview hidden
   ✅ Avatar with initials shown
   ✅ Button turns red
4. Toggle video back on:
   ✅ Video preview appears
   ✅ Button back to gray
5. Mute audio:
   ✅ Button turns red
   ✅ Audio still captured but will be muted in meeting
```

### Test 5: Name Persistence

```bash
1. Enter name "Alice" in pre-join
2. Join meeting
3. Leave meeting
4. Create new meeting
   ✅ Name field should remember "Alice" (from localStorage)
5. Can edit to new name before joining
```

### Test 6: Empty State

```bash
1. Create new meeting
2. On pre-join screen, right panel shows:
   ✅ Icon of people
   ✅ "No one here yet"
   ✅ "Be the first to join!"
```

### Test 7: Participant Info Display

**When someone is in the meeting, you should see**:
```
┌────────────────────────────────────┐
│ In this meeting                     │
│ 1 person already here              │
├────────────────────────────────────┤
│ ┌─────────────────────────────┐    │
│ │  [AP]  Alice Parker          │    │
│ │        Mic on | Camera on    │    │
│ │        ● (connected)         │    │
│ └─────────────────────────────┘    │
└────────────────────────────────────┘
```

- Avatar with initials (colored background)
- User name
- Audio status (green mic if on, red if muted)
- Video status (green camera if on, gray if off)
- Connection status (green dot)

---

## 🎨 UI Features

### Left Panel
- **Video Preview**: Live camera feed or avatar with initials
- **Name Input**: Editable text field, saves to localStorage
- **Device Dropdowns**: Select camera, microphone, speaker
- **Control Buttons**: Toggle video/audio (hover shows tooltip)
- **Join Button**: Large blue button, disabled while joining

### Right Panel  
- **Header**: "In this meeting" with participant count
- **Participant Cards**: Scrollable list with:
  - Avatar with initials
  - Name
  - Audio/video status icons
  - Connection indicator
- **Empty State**: Friendly message when no one is there
- **Info Box**: Blue box with tip about testing devices

### Styling
- Dark theme matching meeting room
- Smooth transitions
- Hover effects
- Custom scrollbar
- Gradient avatars (blue/purple)
- Green/red status indicators

---

## 🔧 Technical Details

### Flow Diagram
```
Home.vue
   │
   │ Click "New Meeting"
   ├─► Generate meeting ID
   │
   ▼
PreJoin.vue (/prejoin/:id)
   │
   │ 1. Request camera/mic permissions
   │ 2. Start preview stream
   │ 3. Fetch existing participants (API)
   │ 4. Connect socket for real-time updates
   │ 5. User adjusts settings
   │
   │ Click "Join Now"
   ├─► Stop preview stream
   ├─► Pass settings via query params
   │
   ▼
Meeting.vue (/meeting/:id?name=Alice&video=true&audio=true&...)
   │
   │ 1. Use query params for initial settings
   │ 2. Request media with selected devices
   │ 3. Join WebRTC room
   │ 4. Start streaming
```

### API Endpoints

**GET `/api/meetings/:id/participants`**
- Returns list of current participants
- Used for initial load on pre-join screen
- Response:
```json
{
  "success": true,
  "participants": [
    {
      "id": "socket-id",
      "userName": "Alice",
      "audioEnabled": true,
      "videoEnabled": true
    }
  ],
  "count": 1
}
```

### Socket Events

**Emit: `preview-room`**
```javascript
socket.emit('preview-room', { meetingId: 'abc123' })
```
- Subscribes to room updates without joining
- Joins `preview-{meetingId}` channel

**Listen: `room-participants-update`**
```javascript
socket.on('room-participants-update', (data) => {
  // data.participants = array of current participants
  // Update UI in real-time
})
```
- Sent when someone joins/leaves
- Sent to both meeting room and preview room

### Query Parameters Passed to Meeting

```
/meeting/abc123?
  name=Alice&
  video=true&
  audio=true&
  cameraId=device-id-1&
  microphoneId=device-id-2&
  speakerId=device-id-3
```

Meeting.vue should read these and:
1. Set initial audio/video states
2. Use specified device IDs
3. Display user's chosen name

---

## ✅ Success Criteria

### Must Work
- [ ] Pre-join screen loads on "New Meeting"
- [ ] Video preview shows (or avatar if no camera)
- [ ] Can enter/edit name
- [ ] Device dropdowns populated
- [ ] Changing device updates preview
- [ ] Audio/video toggle buttons work
- [ ] Can see existing participants
- [ ] Participant list updates in real-time
- [ ] "Join Now" redirects to meeting
- [ ] Settings passed to meeting correctly

### Should Work
- [ ] Name persists across sessions (localStorage)
- [ ] Smooth transitions and animations
- [ ] Tooltips show on button hover
- [ ] Error messages for denied permissions
- [ ] Empty state shows when alone
- [ ] Scrollbar appears with 5+ participants
- [ ] Participant avatars have correct initials
- [ ] Status icons show correct colors

### Nice to Have
- [ ] Audio level visualization (future)
- [ ] Network quality check (future)
- [ ] Browser compatibility check (future)
- [ ] Custom avatar upload (future)

---

## 🐛 Known Issues / Limitations

1. **No Camera Detected**
   - Shows avatar with initials ✅
   - Can still join with audio only ✅
   
2. **Permission Denied**
   - Error message shown
   - Can still join without media (need to handle)
   
3. **Socket Disconnection**
   - Participant list may not update
   - Reconnection logic needed

4. **Name Not Broadcast**
   - Name only local, not synced to participants
   - Need socket event to update name

---

## 📱 Mobile Testing

**TODO**: Test on mobile devices
- Touch gestures
- Device orientation
- Mobile browser compatibility
- Smaller screen layouts

---

## 🎯 Next Enhancements

1. **Audio Level Indicator**
   - Show waveform while speaking
   - Visual feedback for mic working

2. **Network Quality Check**
   - Test connection speed
   - Warn if bandwidth insufficient

3. **Browser Compatibility Check**
   - Detect WebRTC support
   - Show warning for old browsers

4. **Waiting Room**
   - Host can admit/reject guests
   - Knock notification

5. **Virtual Backgrounds**
   - Blur background
   - Custom images
   - Requires canvas processing

---

## 🎉 Ready to Test!

Open http://localhost and try the new onboarding experience! 

**Report any issues with screenshots and browser console logs.**
