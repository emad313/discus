# WebRTC Docker Network Fix - Visual Guide

## The Problem (Before Fix)

```
┌─────────────────────────────────────────────────────────────┐
│ Your Computer (Windows with WSL2)                           │
│                                                              │
│  ┌──────────────┐                                           │
│  │   Browser    │                                           │
│  │ (localhost)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ 1. Try to connect to 127.0.0.1:10000 ❌          │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Loopback     │◄─── This is YOUR machine's localhost     │
│  │ 127.0.0.1    │     NOT the Docker container!            │
│  └──────────────┘                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Docker Network                                       │   │
│  │                                                      │   │
│  │  ┌──────────────────┐                               │   │
│  │  │ Backend Container│                               │   │
│  │  │ IP: 172.17.0.2   │                               │   │
│  │  │                  │                               │   │
│  │  │ Announces:       │                               │   │
│  │  │ 127.0.0.1 ❌     │◄── Browser can't reach this! │   │
│  │  └──────────────────┘                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Result: ❌ Transport Connection Failed
```

---

## The Solution (After Fix)

```
┌─────────────────────────────────────────────────────────────┐
│ Your Computer (Windows with WSL2)                           │
│ Host IP: 192.168.1.9                                        │
│                                                              │
│  ┌──────────────┐                                           │
│  │   Browser    │                                           │
│  │ (localhost)  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ 1. Connect to 192.168.1.9:10050 ✅               │
│         │                                                    │
│         │ 2. Port forwarding via Docker                     │
│         │    192.168.1.9:10050 → 172.17.0.2:10050          │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Docker Network                                       │   │
│  │                                                      │   │
│  │  ┌──────────────────┐                               │   │
│  │  │ Backend Container│◄── 3. Receives connection ✅  │   │
│  │  │ IP: 172.17.0.2   │                               │   │
│  │  │                  │                               │   │
│  │  │ Listens on:      │                               │   │
│  │  │ 0.0.0.0:10050    │                               │   │
│  │  │                  │                               │   │
│  │  │ Announces:       │                               │   │
│  │  │ 192.168.1.9 ✅   │◄── Browser CAN reach this!   │   │
│  │  └──────────────────┘                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Result: ✅ Transport Connected Successfully
```

---

## Multi-User Scenario (What You're Testing)

```
┌──────────────────────────────────────────────────────────────────┐
│ Your Network (192.168.1.x)                                        │
│                                                                   │
│  ┌─────────────────────────────┐                                 │
│  │ Computer (192.168.1.9)      │                                 │
│  │                              │                                 │
│  │  Browser 1                   │  Browser 2 (Incognito)         │
│  │  ┌──────────┐                │  ┌──────────┐                  │
│  │  │ Meeting  │                │  │ Meeting  │                  │
│  │  │ Window 1 │                │  │ Window 2 │                  │
│  │  └────┬─────┘                │  └────┬─────┘                  │
│  │       │                      │       │                         │
│  │       │                      │       │                         │
│  │       └──────────┬───────────┴───────┘                         │
│  │                  │                                             │
│  │                  │ Both connect to:                            │
│  │                  │ 192.168.1.9:3000 (signaling)               │
│  │                  │ 192.168.1.9:10000-10100 (media)            │
│  │                  │                                             │
│  │                  ▼                                             │
│  │       ┌────────────────────┐                                  │
│  │       │ Docker Containers  │                                  │
│  │       │                    │                                  │
│  │       │ ┌────────────────┐ │                                  │
│  │       │ │ Backend        │ │                                  │
│  │       │ │ - Mediasoup    │ │                                  │
│  │       │ │ - Socket.io    │ │                                  │
│  │       │ └────────────────┘ │                                  │
│  │       │                    │                                  │
│  │       │ ┌────────────────┐ │                                  │
│  │       │ │ Frontend       │ │                                  │
│  │       │ │ - Nginx        │ │                                  │
│  │       │ └────────────────┘ │                                  │
│  │       │                    │                                  │
│  │       │ ┌────────────────┐ │                                  │
│  │       │ │ PostgreSQL     │ │                                  │
│  │       │ │ Redis          │ │                                  │
│  │       │ │ Coturn (TURN)  │ │                                  │
│  │       │ └────────────────┘ │                                  │
│  │       └────────────────────┘                                  │
│  └─────────────────────────────┘                                 │
│                                                                   │
│  Result:                                                          │
│  ✅ Both users can see and hear each other                       │
│  ✅ WebRTC transports connected                                  │
│  ✅ Audio streaming in both directions                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## WebRTC Connection Flow (Step by Step)

```
User 1 (Creates Meeting)
┌─────────────────────────────────────────────────────────────┐
│ 1. Open http://localhost                                     │
│    └─► Nginx serves frontend (static files)                 │
│                                                              │
│ 2. Click "Create Meeting"                                   │
│    └─► Frontend generates meeting ID: "1h22hjrqth"          │
│                                                              │
│ 3. Request microphone permission                            │
│    └─► Browser: getUserMedia({ audio: true })               │
│    └─► User clicks "Allow"                                  │
│    └─► Get audio track                                      │
│                                                              │
│ 4. Connect to backend                                       │
│    └─► Socket.io connects to ws://localhost:3000            │
│    └─► Backend: Socket connected ✅                         │
│                                                              │
│ 5. Initialize Mediasoup                                     │
│    └─► GET /api/router-rtp-capabilities                     │
│    └─► Backend returns RTP codecs                           │
│    └─► Frontend creates Device with capabilities            │
│    └─► Device loaded ✅                                     │
│                                                              │
│ 6. Join Room                                                │
│    └─► Socket emit: 'join-room' { meetingId, userName }    │
│    └─► Backend: User joined room                            │
│    └─► Backend assigns to Worker 0 (round-robin)            │
│                                                              │
│ 7. Create Send Transport                                    │
│    └─► Socket emit: 'create-webrtc-transport'               │
│    └─► Backend creates transport:                           │
│        - listenIp: 0.0.0.0                                  │
│        - announcedIp: 192.168.1.9 ✅                        │
│        - Returns ICE candidates                             │
│    └─► Frontend gets transport params                       │
│                                                              │
│ 8. Connect Transport                                        │
│    └─► Browser initiates DTLS handshake                     │
│    └─► Connects to 192.168.1.9:10050 (example port)        │
│    └─► Docker forwards: 192.168.1.9:10050→172.17.0.2:10050│
│    └─► Backend receives connection                          │
│    └─► Transport state: connecting → connected ✅           │
│                                                              │
│ 9. Produce Audio                                            │
│    └─► Send audio track to backend                          │
│    └─► Backend creates Producer                             │
│    └─► Producer ID: 4ce63b5c-2fca-45b9-a1c9-4200626c0568   │
│    └─► Audio streaming ✅                                   │
└─────────────────────────────────────────────────────────────┘

User 2 (Joins Meeting)
┌─────────────────────────────────────────────────────────────┐
│ 1-9. Same steps as User 1                                   │
│                                                              │
│ 10. Backend notifies User 1                                 │
│     └─► Socket emit to User 1: 'new-producer'               │
│     └─► User 1 creates receive transport                    │
│     └─► User 1 consumes User 2's audio                      │
│                                                              │
│ 11. Backend sends User 1's producers to User 2              │
│     └─► User 2 creates receive transport                    │
│     └─► User 2 consumes User 1's audio                      │
│                                                              │
│ 12. Both users connected ✅                                 │
│     └─► User 1 produces → User 2 consumes                   │
│     └─► User 2 produces → User 1 consumes                   │
│     └─► Bidirectional audio streaming ✅                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Participants Panel Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Participants Panel State Management                          │
│                                                              │
│  Meeting.vue                                                 │
│  ┌─────────────────────────────────────────────┐            │
│  │ const showParticipants = ref(false)         │            │
│  │ const userName = ref('Guest')                │            │
│  │                                              │            │
│  │ <button @click="showParticipants = true">   │            │
│  │   <ParticipantsIcon />                      │            │
│  │ </button>                                    │            │
│  │                                              │            │
│  │ <ParticipantsPanel                          │            │
│  │   v-if="showParticipants"                   │            │
│  │   :participant-count="totalParticipants"    │            │
│  │   :remote-participants="participants"       │            │
│  │   :local-user-name="userName"               │            │
│  │   :meeting-id="meetingId"                   │            │
│  │   :is-audio-enabled="isAudioEnabled"        │            │
│  │   :is-video-enabled="isVideoEnabled"        │            │
│  │   @close="showParticipants = false"         │            │
│  │   @update-name="updateUserName"             │            │
│  │ />                                           │            │
│  └─────────────────────────────────────────────┘            │
│                 │                                            │
│                 │ Props passed down                          │
│                 ▼                                            │
│  ParticipantsPanel.vue                                      │
│  ┌─────────────────────────────────────────────┐            │
│  │ Shows:                                       │            │
│  │ - Local user (editable name)                │            │
│  │ - Mic/camera status icons                   │            │
│  │ - Remote participants list                  │            │
│  │ - Meeting ID with copy button               │            │
│  │                                              │            │
│  │ Actions:                                     │            │
│  │ - Edit name (emit update-name)              │            │
│  │ - Copy meeting ID                            │            │
│  │ - Close panel (emit close)                  │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Configuration Files

```
backend/.env
┌─────────────────────────────────────────────────────────────┐
│ MEDIASOUP_LISTEN_IP=0.0.0.0      ← Listen on all interfaces│
│ MEDIASOUP_ANNOUNCED_IP=192.168.1.9  ← Browser connects here│
│ MEDIASOUP_MIN_PORT=10000          ← RTP port range start   │
│ MEDIASOUP_MAX_PORT=11000          ← RTP port range end     │
└─────────────────────────────────────────────────────────────┘

docker-compose.yml
┌─────────────────────────────────────────────────────────────┐
│ backend:                                                     │
│   ports:                                                     │
│     - "3000:3000"               ← WebSocket/HTTP           │
│     - "10000-10100:10000-10100/udp"  ← Mediasoup RTP (UDP)│
│     - "10000-10100:10000-10100/tcp"  ← Mediasoup RTP (TCP)│
│   environment:                                              │
│     - HOST=0.0.0.0              ← Listen on all interfaces │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### What Changed
1. **MEDIASOUP_ANNOUNCED_IP**: 127.0.0.1 → 192.168.1.9
2. **Added**: ParticipantsPanel.vue component
3. **Fixed**: Socket cleanup warning

### Why It Works Now
- Browser connects to reachable IP (192.168.1.9)
- Docker port forwarding routes to container
- Mediasoup transport connects successfully
- Audio can flow in both directions

### Network Requirements
- Same LAN: Works directly (what you're testing)
- Different networks: Need TURN server (coturn already running)
- Public internet: Need public IP or TURN relay

**Everything is ready for testing!** 🚀
