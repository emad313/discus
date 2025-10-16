# Next Actions - UI & Functionality Improvements

## 🔧 Transport Fix Applied!

**Changed**: `docker-compose.yml` - Removed environment override
**Result**: Backend now uses `MEDIASOUP_ANNOUNCED_IP=192.168.1.9` from `.env`

### Test Now (2 minutes)
```bash
1. Open http://localhost (two windows)
2. Create meeting → Join meeting
3. Check console: Should see "connected" NOT "failed" ✅
```

---

## 🎨 Phase 3 Priority: Google Meet UI/UX

### Today's Focus (4-6 hours)

#### 1. Active Speaker Detection ⭐ HIGH PRIORITY
**Time**: 2-3 hours
**Goal**: Highlight who's speaking with animated border

**Implementation**:
```javascript
// Create: frontend/src/composables/useActiveSpeaker.js
- Monitor audio levels from producers/consumers
- Detect voice activity threshold
- Return active speaker ID
- Auto-update every 100ms

// Update: frontend/src/views/Meeting.vue
- Add computed activeSpeakerId
- Apply border animation to active speaker tile
- Show audio level indicator
```

**UI Effect**:
- Speaking participant gets glowing blue border
- Small audio wave animation
- Updates in real-time

---

#### 2. Improved Video Grid Layout ⭐ HIGH PRIORITY
**Time**: 2 hours
**Goal**: Better responsive grid like Google Meet

**Implementation**:
```javascript
// Update: frontend/src/views/Meeting.vue - getGridClass computed

const getGridClass = computed(() => {
  const total = totalParticipants.value
  
  if (total === 1) {
    // Single user: Large centered
    return 'grid-cols-1 max-w-4xl mx-auto'
  }
  
  if (total === 2) {
    // Two users: Side by side on desktop, stacked on mobile
    return 'grid-cols-1 lg:grid-cols-2 gap-4'
  }
  
  if (total <= 4) {
    // 3-4 users: 2x2 grid
    return 'grid-cols-2 lg:grid-cols-2 gap-3'
  }
  
  if (total <= 6) {
    // 5-6 users: 2x3 grid
    return 'grid-cols-2 lg:grid-cols-3 gap-2'
  }
  
  if (total <= 9) {
    // 7-9 users: 3x3 grid
    return 'grid-cols-3 lg:grid-cols-3 gap-2'
  }
  
  if (total <= 16) {
    // 10-16 users: 4x4 grid
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'
  }
  
  // 17+ users: Paginated 4x4 with controls
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1'
})
```

**UI Improvements**:
- Better spacing and gaps
- Responsive breakpoints
- Smooth CSS transitions
- Aspect ratio maintained

---

#### 3. Layout Switcher (Grid/Spotlight/Sidebar) ⭐ MEDIUM PRIORITY
**Time**: 1-2 hours
**Goal**: Toggle between different view modes

**Create**: `frontend/src/components/LayoutSwitcher.vue`
```vue
<template>
  <div class="flex items-center space-x-2 bg-[#202124] rounded-lg p-1">
    <button @click="setLayout('grid')" :class="...">
      <GridIcon />
    </button>
    <button @click="setLayout('spotlight')" :class="...">
      <SpotlightIcon />
    </button>
    <button @click="setLayout('sidebar')" :class="...">
      <SidebarIcon />
    </button>
  </div>
</template>
```

**Layouts**:
1. **Grid**: All participants equal size (current)
2. **Spotlight**: 1 large speaker + small thumbnails
3. **Sidebar**: 1 large left + vertical thumbnails right

---

#### 4. Settings Panel ⭐ MEDIUM PRIORITY
**Time**: 3 hours
**Goal**: Device selection and quality settings

**Create**: `frontend/src/components/SettingsPanel.vue`
```vue
<template>
  <div class="fixed right-0 top-0 h-full w-96 bg-[#202124] shadow-2xl">
    <!-- Audio Settings -->
    <section>
      <h3>Audio</h3>
      <select v-model="selectedMicrophone">
        <option v-for="mic in microphones">{{ mic.label }}</option>
      </select>
      <select v-model="selectedSpeaker">
        <option v-for="spk in speakers">{{ spk.label }}</option>
      </select>
      <input type="range" v-model="micVolume" /> <!-- Volume slider -->
    </section>

    <!-- Video Settings -->
    <section>
      <h3>Video</h3>
      <select v-model="selectedCamera">
        <option v-for="cam in cameras">{{ cam.label }}</option>
      </select>
      <select v-model="videoQuality">
        <option value="360p">360p (Low bandwidth)</option>
        <option value="480p">480p (Medium)</option>
        <option value="720p">720p (HD)</option>
        <option value="1080p">1080p (Full HD)</option>
      </select>
    </section>

    <!-- General Settings -->
    <section>
      <h3>General</h3>
      <input v-model="displayName" placeholder="Your name" />
      <toggle v-model="darkMode" label="Dark mode" />
    </section>
  </div>
</template>
```

---

### Tomorrow's Focus (4-6 hours)

#### 5. Pre-join Screen
**Goal**: Device check before entering meeting
- Camera/mic preview
- Device selection
- Name input
- Audio/video toggle

#### 6. Enhanced Video Tiles
**Goal**: Better participant tiles
- Name overlay at bottom
- Muted/unmuted indicator
- Camera off placeholder
- Connection quality (3 bars)
- Pin button (top-right)

#### 7. Screen Sharing Full Implementation
**Goal**: Complete screen sharing feature
- Start/stop screen share
- Layout auto-switch to spotlight
- "You are sharing" banner
- Application/window selector

---

## 🚀 Implementation Order (Recommended)

### Step 1: Test Transport Fix (NOW - 2 min)
```bash
# Verify transport connects successfully
Open two browser windows → Test audio call
```

### Step 2: Active Speaker Detection (2-3 hours)
**Why First?**: Core UX feature, makes calls feel alive
**Impact**: High - visual feedback is crucial
**Complexity**: Medium

### Step 3: Layout Improvements (2 hours)
**Why Second?**: Better grid = better experience for 3+ users
**Impact**: High - affects all users
**Complexity**: Low

### Step 4: Layout Switcher (1-2 hours)
**Why Third?**: User preference, nice to have
**Impact**: Medium - power users will love it
**Complexity**: Low

### Step 5: Settings Panel (3 hours)
**Why Fourth?**: Device selection is important but not urgent
**Impact**: Medium - audio/video quality control
**Complexity**: Medium

### Step 6: Pre-join Screen (2 hours)
**Why Fifth?**: Better onboarding experience
**Impact**: Medium - first impression matters
**Complexity**: Low

### Step 7: Video Tile Enhancements (2 hours)
**Why Sixth?**: Polish existing features
**Impact**: Medium - visual improvements
**Complexity**: Low

### Step 8: Screen Sharing (3-4 hours)
**Why Seventh?**: Feature-complete for basic usage
**Impact**: High - essential for meetings
**Complexity**: High

---

## 📝 Implementation Template

For each feature, follow this pattern:

### 1. Create Component/Composable
```bash
# Create new file
frontend/src/components/[ComponentName].vue
# or
frontend/src/composables/use[FeatureName].js
```

### 2. Implement Logic
```javascript
// State management
const state = ref(...)

// Business logic
const doSomething = () => {
  // Implementation
}

// Cleanup
onUnmounted(() => {
  // Cleanup
})
```

### 3. Add to Meeting.vue
```vue
<script setup>
import NewComponent from './components/NewComponent.vue'
</script>

<template>
  <NewComponent :prop="value" @event="handler" />
</template>
```

### 4. Test
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Test in browser
# Check console for errors
# Test functionality
# Test with multiple users
```

### 5. Commit
```bash
git add .
git commit -m "feat: add [feature name]"
git push
```

---

## 🎯 Quick Wins (1-2 hours each)

These can be done independently:

### A. Name Labels on Video Tiles
**File**: `Meeting.vue`
**Add**: Overlay `<div>` at bottom of each video tile with participant name

### B. Connection Quality Indicator
**File**: `Meeting.vue`
**Add**: 3-bar indicator (good/medium/poor) based on RTT

### C. Copy Meeting Link Button
**File**: `Meeting.vue`
**Add**: Button that copies `http://localhost/meeting/{id}` to clipboard

### D. Notification Toasts
**Install**: `vue-toastification` or create simple toast component
**Add**: Toast for join/leave events

### E. Keyboard Shortcuts
**File**: `Meeting.vue`
**Add**: `onMounted` keyboard listener
- Space: Toggle mic
- Ctrl+E: Toggle camera
- Ctrl+D: Screen share
- Escape: Close panels

---

## 💻 Code Snippets for Quick Start

### Active Speaker Detection (Starter Code)

```javascript
// frontend/src/composables/useActiveSpeaker.js
import { ref, onUnmounted } from 'vue'

export function useActiveSpeaker(producers, consumers) {
  const activeSpeakerId = ref(null)
  let intervalId = null

  const detectActiveSpeaker = () => {
    let maxVolume = 0
    let speakerId = null

    // Check local producer
    producers.value.forEach((producer, id) => {
      if (producer.kind === 'audio' && !producer.paused) {
        // Get audio level from track
        const track = producer.track
        // Implement volume detection here
        const volume = getAudioLevel(track) // Custom function
        
        if (volume > maxVolume) {
          maxVolume = volume
          speakerId = 'local'
        }
      }
    })

    // Check remote consumers
    consumers.value.forEach((consumer, id) => {
      if (consumer.kind === 'audio' && !consumer.paused) {
        const track = consumer.track
        const volume = getAudioLevel(track)
        
        if (volume > maxVolume) {
          maxVolume = volume
          speakerId = consumer.appData.peerId
        }
      }
    })

    if (maxVolume > 0.1) { // Threshold
      activeSpeakerId.value = speakerId
    } else {
      activeSpeakerId.value = null
    }
  }

  // Start detection
  intervalId = setInterval(detectActiveSpeaker, 100)

  // Cleanup
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    activeSpeakerId
  }
}
```

### Layout Switcher (Starter Code)

```vue
<!-- frontend/src/components/LayoutSwitcher.vue -->
<template>
  <div class="flex items-center space-x-1 bg-[#292A2D] rounded-lg p-1">
    <button
      @click="$emit('change-layout', 'grid')"
      :class="[
        'p-2 rounded transition-colors',
        currentLayout === 'grid' 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:text-white'
      ]"
      title="Grid view"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    </button>
    
    <button
      @click="$emit('change-layout', 'spotlight')"
      :class="[
        'p-2 rounded transition-colors',
        currentLayout === 'spotlight' 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:text-white'
      ]"
      title="Spotlight view"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" clip-rule="evenodd"/>
      </svg>
    </button>
    
    <button
      @click="$emit('change-layout', 'sidebar')"
      :class="[
        'p-2 rounded transition-colors',
        currentLayout === 'sidebar' 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:text-white'
      ]"
      title="Sidebar view"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm12 1H5v10h10V5z" clip-rule="evenodd"/>
        <path d="M6 6h2v8H6V6zm3 0h5v8H9V6z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentLayout: {
    type: String,
    default: 'grid'
  }
})

defineEmits(['change-layout'])
</script>
```

---

## ✅ Ready to Start!

### Your Current State:
- ✅ Transport fixed (`192.168.1.9` now active)
- ✅ Audio calling works
- ✅ Participants panel works
- ✅ Chat works
- ✅ All Docker services healthy

### Start With:
1. **Test transport fix** (2 min)
2. **Active speaker detection** (2-3 hours) ← Start here!
3. **Grid layout improvements** (2 hours)

**Let's make this look and feel like Google Meet!** 🚀
