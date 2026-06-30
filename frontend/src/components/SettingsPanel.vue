<template>
  <div class="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-white dark:bg-[#202124] shadow-2xl z-30 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h2>
      <button
        @click="$emit('close')"
        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Display Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Display name
        </label>
        <input
          v-model="localDisplayName"
          @blur="updateDisplayName"
          type="text"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
          placeholder="Enter your name"
        />
      </div>

      <!-- Camera Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Camera
        </label>
        <select
          v-model="selectedCamera"
          @change="handleCameraChange"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
        >
          <option v-if="cameras.length === 0" value="">No cameras found</option>
          <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
            {{ camera.label || `Camera ${cameras.indexOf(camera) + 1}` }}
          </option>
        </select>
      </div>

      <!-- Microphone Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Microphone
        </label>
        <select
          v-model="selectedMicrophone"
          @change="handleMicrophoneChange"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
        >
          <option v-if="microphones.length === 0" value="">No microphones found</option>
          <option v-for="mic in microphones" :key="mic.deviceId" :value="mic.deviceId">
            {{ mic.label || `Microphone ${microphones.indexOf(mic) + 1}` }}
          </option>
        </select>
      </div>

      <!-- Speaker Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Speakers
        </label>
        <select
          v-model="selectedSpeaker"
          @change="handleSpeakerChange"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
        >
          <option v-if="speakers.length === 0" value="">Default speakers</option>
          <option v-for="speaker in speakers" :key="speaker.deviceId" :value="speaker.deviceId">
            {{ speaker.label || `Speaker ${speakers.indexOf(speaker) + 1}` }}
          </option>
        </select>
      </div>

      <!-- Video Quality -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Video quality
        </label>
        <select
          v-model="videoQuality"
          @change="handleVideoQualityChange"
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
        >
          <option value="360p">360p (Low quality, saves bandwidth)</option>
          <option value="480p">480p (Standard quality)</option>
          <option value="720p">720p (HD quality)</option>
          <option value="1080p">1080p (Full HD quality)</option>
        </select>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Higher quality uses more bandwidth
        </p>
      </div>

      <!-- Audio Settings -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Audio settings
        </label>
        
        <!-- Noise Suppression -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-700 dark:text-gray-300">Noise suppression</span>
          <button
            @click="toggleNoiseSuppression"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              noiseSuppression ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                noiseSuppression ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>

        <!-- Echo Cancellation -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700 dark:text-gray-300">Echo cancellation</span>
          <button
            @click="toggleEchoCancellation"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              echoCancellation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                echoCancellation ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Theme -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Theme
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            @click="setTheme('light')"
            :class="[
              'px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            ]"
          >
            Light
          </button>
          <button
            @click="setTheme('dark')"
            :class="[
              'px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            ]"
          >
            Dark
          </button>
          <button
            @click="setTheme('auto')"
            :class="[
              'px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
              theme === 'auto'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            ]"
          >
            Auto
          </button>
        </div>
      </div>

      <!-- Statistics (optional) -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connection stats</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Connection type:</span>
            <span class="text-gray-900 dark:text-white font-medium">WebRTC</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Video codec:</span>
            <span class="text-gray-900 dark:text-white font-medium">VP8/VP9</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Audio codec:</span>
            <span class="text-gray-900 dark:text-white font-medium">Opus</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('close')"
        class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  displayName: {
    type: String,
    default: 'Guest'
  },
  currentCamera: String,
  currentMicrophone: String,
  currentSpeaker: String
})

const emit = defineEmits(['close', 'update-name', 'change-camera', 'change-microphone', 'change-speaker', 'change-video-quality'])

// Local state
const localDisplayName = ref(props.displayName)
const cameras = ref([])
const microphones = ref([])
const speakers = ref([])
const selectedCamera = ref(props.currentCamera || '')
const selectedMicrophone = ref(props.currentMicrophone || '')
const selectedSpeaker = ref(props.currentSpeaker || '')
const videoQuality = ref('720p')
const noiseSuppression = ref(true)
const echoCancellation = ref(true)
const theme = ref('dark')

// Load saved preferences
onMounted(async () => {
  // Load saved preferences from localStorage
  videoQuality.value = localStorage.getItem('video-quality') || '720p'
  noiseSuppression.value = localStorage.getItem('noise-suppression') !== 'false'
  echoCancellation.value = localStorage.getItem('echo-cancellation') !== 'false'
  theme.value = localStorage.getItem('theme') || 'dark'
  
  // Enumerate devices
  await enumerateDevices()
})

// Enumerate media devices
const enumerateDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    
    cameras.value = devices.filter(device => device.kind === 'videoinput')
    microphones.value = devices.filter(device => device.kind === 'audioinput')
    speakers.value = devices.filter(device => device.kind === 'audiooutput')
    
    console.log('[SettingsPanel] Found devices:', {
      cameras: cameras.value.length,
      microphones: microphones.value.length,
      speakers: speakers.value.length
    })
    
    // Set defaults if not already set
    if (!selectedCamera.value && cameras.value.length > 0) {
      selectedCamera.value = cameras.value[0].deviceId
    }
    if (!selectedMicrophone.value && microphones.value.length > 0) {
      selectedMicrophone.value = microphones.value[0].deviceId
    }
    if (!selectedSpeaker.value && speakers.value.length > 0) {
      selectedSpeaker.value = speakers.value[0].deviceId
    }
  } catch (error) {
    console.error('[SettingsPanel] Failed to enumerate devices:', error)
  }
}

// Update display name
const updateDisplayName = () => {
  if (localDisplayName.value.trim()) {
    emit('update-name', localDisplayName.value.trim())
    localStorage.setItem('user-display-name', localDisplayName.value.trim())
  }
}

// Handle camera change
const handleCameraChange = () => {
  emit('change-camera', selectedCamera.value)
  localStorage.setItem('selected-camera', selectedCamera.value)
}

// Handle microphone change
const handleMicrophoneChange = () => {
  emit('change-microphone', selectedMicrophone.value)
  localStorage.setItem('selected-microphone', selectedMicrophone.value)
}

// Handle speaker change
const handleSpeakerChange = () => {
  emit('change-speaker', selectedSpeaker.value)
  localStorage.setItem('selected-speaker', selectedSpeaker.value)
}

// Handle video quality change
const handleVideoQualityChange = () => {
  emit('change-video-quality', videoQuality.value)
  localStorage.setItem('video-quality', videoQuality.value)
}

// Toggle noise suppression
const toggleNoiseSuppression = () => {
  noiseSuppression.value = !noiseSuppression.value
  localStorage.setItem('noise-suppression', noiseSuppression.value.toString())
  console.log('[SettingsPanel] Noise suppression:', noiseSuppression.value)
}

// Toggle echo cancellation
const toggleEchoCancellation = () => {
  echoCancellation.value = !echoCancellation.value
  localStorage.setItem('echo-cancellation', echoCancellation.value.toString())
  console.log('[SettingsPanel] Echo cancellation:', echoCancellation.value)
}

// Set theme
const setTheme = (newTheme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  
  // Apply theme to document
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (newTheme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // Auto: use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  console.log('[SettingsPanel] Theme set to:', newTheme)
}

// Watch for external prop changes
watch(() => props.displayName, (newName) => {
  localDisplayName.value = newName
})
</script>
