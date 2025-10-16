# Bug Fix: WebSocket Connection Failed

## Issue Description
Browser console showed repeated errors:
```
WebSocket connection to 'ws://localhost:3000/socket.io/?EIO=4&transport=websocket' failed
```

The frontend couldn't establish a WebSocket connection to the backend for real-time video streaming.

## Root Cause

### CORS Mismatch
The backend CORS configuration was set to only allow `http://localhost:5173` (Vite development server), but:
- **Production frontend** is served from `http://localhost` (port 80) by Nginx
- **Development frontend** runs on `http://localhost:5173` (Vite dev server)

When accessing the production build at `http://localhost`, the browser sends:
```
Origin: http://localhost
```

But the backend rejected it because CORS only allowed:
```
CORS_ORIGIN=http://localhost:5173
```

### WebSocket Handshake Failure
Socket.io performs an HTTP upgrade to WebSocket protocol:
1. Browser sends HTTP request with `Origin: http://localhost`
2. Backend checks CORS policy
3. ❌ Origin doesn't match → Connection rejected
4. WebSocket handshake fails

## Fixes Applied

### Fix 1: Update Backend .env (Multiple Origins)
**File**: `backend/.env`

```properties
# OLD
CORS_ORIGIN=http://localhost:5173

# NEW - Support both development and production
CORS_ORIGIN=http://localhost:5173,http://localhost
```

Now supports comma-separated list of allowed origins.

### Fix 2: Update Config Parser
**File**: `backend/src/config/environment.js`

```javascript
// OLD - Single origin only
corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

// NEW - Parse comma-separated origins into array
corsOrigin: process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost'],
```

**Benefits**:
- Supports multiple origins from environment variable
- Trims whitespace automatically
- Falls back to both development and production URLs
- Array format for easy validation

### Fix 3: Enhanced CORS Middleware
**File**: `backend/src/app.js`

```javascript
// OLD - Direct origin assignment
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// NEW - Dynamic origin validation function
const corsOrigin = Array.isArray(config.corsOrigin) 
  ? config.corsOrigin 
  : [config.corsOrigin];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (corsOrigin.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

**Improvements**:
- ✅ Validates origin against whitelist
- ✅ Allows requests without origin (native apps, API testing)
- ✅ Logs blocked requests for debugging
- ✅ Returns clear error message
- ✅ Maintains credential support

## How It Works Now

### Development Mode
```
Developer accesses: http://localhost:5173
Browser sends:      Origin: http://localhost:5173
Backend checks:     ✅ In allowed list
Result:            Connection successful
```

### Production Mode
```
User accesses:     http://localhost (port 80)
Browser sends:     Origin: http://localhost
Backend checks:    ✅ In allowed list
Result:           Connection successful
```

### Mobile/Native Apps
```
App makes request: No Origin header
Backend checks:    ✅ No origin is allowed
Result:           Connection successful
```

### Unauthorized Origin
```
Hacker tries:     http://evil-site.com
Browser sends:    Origin: http://evil-site.com
Backend checks:   ❌ Not in allowed list
Backend logs:     "CORS blocked request from origin: http://evil-site.com"
Result:          Connection rejected
```

## Testing

### Test 1: Production Frontend
```bash
# Open browser
http://localhost

# Open DevTools (F12) → Console
# Should see:
[WebRTC] Connected to signaling server
[WebRTC] Socket connected

# Should NOT see:
WebSocket connection failed ❌
```

### Test 2: Development Frontend
```bash
# Start Vite dev server
cd frontend
npm run dev

# Open browser
http://localhost:5173

# Should also work with development server
```

### Test 3: Backend Logs
```bash
# Check CORS configuration
docker-compose logs backend | grep CORS

# Should show:
[INFO] CORS Origin: http://localhost:5173,http://localhost
```

### Test 4: Socket.io Connection
```bash
# Browser Console (F12)
# Should see successful WebSocket upgrade:
ws://localhost:3000/socket.io/?EIO=4&transport=websocket (101 Switching Protocols)
```

## Configuration Options

### Single Origin (Simple)
```properties
CORS_ORIGIN=http://localhost
```

### Multiple Origins (Recommended)
```properties
CORS_ORIGIN=http://localhost:5173,http://localhost,http://localhost:8080
```

### Production with Custom Domain
```properties
CORS_ORIGIN=https://meet.yourdomain.com,https://yourdomain.com
```

### Wildcard Subdomains (Advanced)
For wildcard support, you'll need to modify the CORS function:
```javascript
origin: (origin, callback) => {
  if (!origin) return callback(null, true);
  
  // Allow any subdomain of yourdomain.com
  if (origin.match(/^https?:\/\/[a-z0-9-]+\.yourdomain\.com$/)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

## Security Considerations

### What's Protected
- ✅ Only whitelisted origins can connect
- ✅ Credentials (cookies, auth tokens) respected
- ✅ Unauthorized origins blocked and logged
- ✅ XSS attacks from other domains prevented

### Production Checklist
- [ ] Remove development URLs from CORS_ORIGIN
- [ ] Use HTTPS in production
- [ ] Set specific domain (don't use `*`)
- [ ] Enable rate limiting
- [ ] Monitor CORS blocking logs
- [ ] Keep allowed origins list minimal

### Environment-Specific Configuration

**Development** (`.env`):
```properties
CORS_ORIGIN=http://localhost:5173,http://localhost
NODE_ENV=development
```

**Production** (`.env.production`):
```properties
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

## Files Modified

1. ✅ **backend/.env**
   - Added multiple origins support

2. ✅ **backend/src/config/environment.js**
   - Parse comma-separated CORS origins
   - Return array instead of string

3. ✅ **backend/src/app.js**
   - Dynamic CORS origin validation
   - Request logging for blocked origins
   - Allow requests without origin header

## Deployment

```bash
# Rebuild backend
cd /e/Emad/Projects/discus
docker-compose build backend

# Restart backend
docker-compose up -d backend

# Verify
docker-compose logs backend | grep CORS
```

## Common Issues

### Issue: Still Getting Connection Errors
**Check**:
1. Backend is running: `docker-compose ps backend`
2. CORS configured: `docker-compose logs backend | grep CORS`
3. Frontend URL matches: Check browser address bar
4. Browser cache: Hard refresh (Ctrl+F5)

### Issue: Works in Dev, Fails in Production
**Cause**: Production URL not in CORS_ORIGIN
**Fix**: Add production URL to CORS_ORIGIN

### Issue: Mobile App Can't Connect
**Check**: Ensure origin validation allows `null` origin

### Issue: CORS Error Only on WebSocket
**Cause**: Socket.io CORS config might differ from Express CORS
**Fix**: Ensure both use same `config.corsOrigin`:
```javascript
// Express
app.use(cors({ origin: corsOrigin }))

// Socket.io
const io = new Server(httpServer, {
  cors: { origin: config.corsOrigin }
})
```

## Benefits of This Fix

### Flexibility
- ✅ Supports development and production simultaneously
- ✅ Easy to add new origins (just update .env)
- ✅ No code changes needed for new environments

### Security
- ✅ Explicit whitelist (no wildcards)
- ✅ Logs rejected requests
- ✅ Clear error messages for debugging

### Maintainability
- ✅ Configuration in one place (.env)
- ✅ Environment-specific settings
- ✅ Easy to review allowed origins

## Summary

**Problem**: WebSocket connection failed due to CORS origin mismatch  
**Root Cause**: Backend only allowed `http://localhost:5173`, but production uses `http://localhost`  
**Solution**: Support multiple comma-separated origins in CORS configuration  
**Result**: Both development and production frontends can connect successfully  

**Status**: ✅ FIXED and DEPLOYED

---

**Build & Deploy**:
```bash
docker-compose build backend
docker-compose up -d backend
```

**Verify**:
```bash
# Check backend logs
docker-compose logs backend | grep "CORS Origin"

# Should show:
CORS Origin: http://localhost:5173,http://localhost
```

**Test**: Open `http://localhost` and check browser console - no WebSocket errors! ✅
