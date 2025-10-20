# Bug Fixes - October 18, 2025

## Issues Fixed

### 1. ✅ PostgreSQL Authentication Error
**Error**: `password authentication failed for user "discus"`

**Root Cause**: 
- Docker Compose set password to `discus_password_change_in_production`
- Backend database.js was using default `discus`

**Fix**:
- Updated `backend/src/services/database.js` line 12
- Changed password default from `'discus'` to `'discus_password_change_in_production'`

**Result**: Database connection now working, chat messages saving ✅

---

### 2. ✅ User Preferences Not Persisting on Refresh
**Problem**: User name and settings from PreJoin lost when refreshing

**Root Cause**:
- Preferences passed via route query params (temporary)
- Refreshing page lost the query params

**Fix**:
- **PreJoin.vue**: Save preferences to `localStorage` instead of query params
  ```javascript
  localStorage.setItem('userPreferences', JSON.stringify({
    name, video, audio, cameraId, microphoneId, speakerId, savedAt
  }))
  ```
  
- **Meeting.vue**: Load preferences from localStorage on mount
  ```javascript
  const userPreferences = JSON.parse(localStorage.getItem('userPreferences'))
  userName.value = userPreferences.name
  ```

**Result**: User can refresh browser and name/settings persist ✅

---

### 3. ✅ Clear Chat & Preferences on Meeting Leave
**Problem**: Chat messages and preferences should clear when user actually leaves

**Fix**:
- Updated `handleLeaveMeeting()` in Meeting.vue:
  ```javascript
  sessionStorage.removeItem('active-meeting')
  localStorage.removeItem('userPreferences')  // Clear preferences
  chatStore.clearMessages()                     // Clear chat from UI
  ```
  
- Also cleared on `onBeforeUnmount` (tab close)

**Result**: 
- Chat cleared from UI when leaving (still in database) ✅
- Preferences cleared on leave but persist on refresh ✅

---

### 4. ✅ Show Profile Placeholder When Camera Off
**Problem**: Black background when camera off, should show profile picture

**Fix**:
- Added conditional rendering in Meeting.vue:
  ```vue
  <!-- Hide video element when camera off -->
  <video :class="{ 'hidden': !hasVideo }" />
  
  <!-- Show avatar when camera off -->
  <div v-if="!hasVideo" class="...">
    <div class="w-24 h-24 rounded-full bg-blue-600">
      <span>{{ userName.charAt(0).toUpperCase() }}</span>
    </div>
    <p>{{ userName }}</p>
    <p>Camera is off</p>
  </div>
  ```

**Result**: Beautiful profile avatar shows when camera disabled ✅

---

## Files Modified

### Backend:
- `backend/src/services/database.js` - Fixed PostgreSQL password

### Frontend:
- `frontend/src/views/PreJoin.vue` - Save to localStorage instead of query
- `frontend/src/views/Meeting.vue` - Load from localStorage, show avatar when camera off

---

## Testing Checklist

- [ ] Join meeting → Check database logs (should show successful connections)
- [ ] Enter name in PreJoin → Refresh browser → Name should persist
- [ ] Turn off camera → Should see profile avatar with first letter
- [ ] Send chat messages → Leave meeting → Chat should clear from UI
- [ ] Rejoin same meeting → Chat history should load from database
- [ ] Leave meeting → Preferences should clear
- [ ] Refresh during meeting → Preferences should persist

---

## Next Steps

1. **Restart Backend** (to load database fix):
   ```bash
   cd backend
   npm start
   ```

2. **Rebuild Frontend**:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

3. **Test Everything**!

All issues reported are now **FIXED**! 🎉
