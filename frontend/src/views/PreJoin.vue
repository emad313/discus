<template>
  <div class="min-h-screen bg-[#202124] flex items-center justify-center p-4">
    <div class="max-w-6xl w-full">
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Left Panel: Video/Audio Preview -->
        <div class="bg-[#292A2D] rounded-2xl p-6 space-y-6">
          <!-- Header -->
          <div class="text-center">
            <h1 class="text-2xl font-semibold text-white mb-2">Ready to join?</h1>
            <p class="text-gray-400 text-sm">{{ meetingId }}</p>
          </div>

          <!-- Video Preview -->
          <div class="relative aspect-video bg-[#1A1B1E] rounded-xl overflow-hidden">
            <video
              ref="previewVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
              :class="{ 'hidden': !isVideoEnabled }"
            ></video>
            
            <!-- Video Off Placeholder -->
            <div
              v-if="!isVideoEnabled"
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <span class="text-4xl font-bold text-white">{{ userInitials }}</span>
              </div>
              <p class="text-gray-400">Camera is off</p>
            </div>

            <!-- Name Overlay -->
            <div class="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
              <span class="text-white text-sm">{{ displayName || 'Guest' }}</span>
            </div>

            <!-- Controls Overlay -->
            <div class="absolute bottom-4 right-4 flex space-x-2">
              <button
                @click="toggleVideo"
                :class="[
                  'p-3 rounded-full transition-all',
                  isVideoEnabled 
                    ? 'bg-[#3C4043] hover:bg-[#5F6368]' 
                    : 'bg-red-600 hover:bg-red-700'
                ]"
                :title="isVideoEnabled ? 'Turn off camera' : 'Turn on camera'"
              >
                <svg v-if="isVideoEnabled" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v.586l-4-4V4a2 2 0 00-2-2H6.414l-2.707-2.707zm3.586 3.586l7.414 7.414-1.121.561-2 1A1 1 0 0110 14V8.586l-2.707-2.707z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                @click="toggleAudio"
                :class="[
                  'p-3 rounded-full transition-all',
                  isAudioEnabled 
                    ? 'bg-[#3C4043] hover:bg-[#5F6368]' 
                    : 'bg-red-600 hover:bg-red-700'
                ]"
                :title="isAudioEnabled ? 'Mute' : 'Unmute'"
              >
                <svg v-if="isAudioEnabled" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Device Settings -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
              <input
                v-model="displayName"
                type="text"
                placeholder="Enter your name"
                class="w-full px-4 py-3 bg-[#3C4043] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="joinMeeting"
              />
            </div>

            <div v-if="cameras.length > 0">
              <label class="block text-sm font-medium text-gray-300 mb-2">Camera</label>
              <select
                v-model="selectedCameraId"
                @change="changeCamera"
                class="w-full px-4 py-3 bg-[#3C4043] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
                  {{ camera.label || `Camera ${cameras.indexOf(camera) + 1}` }}
                </option>
              </select>
            </div>

            <div v-if="microphones.length > 0">
              <label class="block text-sm font-medium text-gray-300 mb-2">Microphone</label>
              <select
                v-model="selectedMicrophoneId"
                @change="changeMicrophone"
                class="w-full px-4 py-3 bg-[#3C4043] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="mic in microphones" :key="mic.deviceId" :value="mic.deviceId">
                  {{ mic.label || `Microphone ${microphones.indexOf(mic) + 1}` }}
                </option>
              </select>
            </div>

            <div v-if="speakers.length > 0">
              <label class="block text-sm font-medium text-gray-300 mb-2">Speaker</label>
              <select
                v-model="selectedSpeakerId"
                class="w-full px-4 py-3 bg-[#3C4043] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="speaker in speakers" :key="speaker.deviceId" :value="speaker.deviceId">
                  {{ speaker.label || `Speaker ${speakers.indexOf(speaker) + 1}` }}
                </option>
              </select>
            </div>
          </div>

          <!-- Join Button -->
          <button
            @click="joinMeeting"
            :disabled="isJoining"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <span v-if="isJoining">Joining...</span>
            <span v-else>Join Now</span>
          </button>
        </div>

        <!-- Right Panel: Participants Already in Meeting -->
        <div class="bg-[#292A2D] rounded-2xl p-6 space-y-6">
          <!-- Header -->
          <div>
            <h2 class="text-xl font-semibold text-white mb-2">In this meeting</h2>
            <p class="text-gray-400 text-sm">
              {{ existingParticipants.length }} {{ existingParticipants.length === 1 ? 'person' : 'people' }} already here
            </p>
          </div>

          <!-- Participants List -->
          <div class="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            <!-- Empty State -->
            <div v-if="existingParticipants.length === 0" class="text-center py-12">
              <svg class="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-400 text-lg">No one here yet</p>
              <p class="text-gray-500 text-sm mt-2">Be the first to join!</p>
            </div>

            <!-- Participant Cards -->
            <div
              v-for="participant in existingParticipants"
              :key="participant.id"
              class="flex items-center space-x-3 p-4 bg-[#3C4043] rounded-lg hover:bg-[#5F6368] transition-colors"
            >
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span class="text-white font-semibold text-lg">
                  {{ getInitials(participant.userName) }}
                </span>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-white font-medium truncate">
                  {{ participant.userName || 'Guest' }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <!-- Audio Status -->
                  <div class="flex items-center space-x-1">
                    <svg
                      :class="[
                        'w-3 h-3',
                        participant.audioEnabled ? 'text-green-500' : 'text-red-500'
                      ]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path v-if="participant.audioEnabled" fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                      <path v-else fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs text-gray-400">
                      {{ participant.audioEnabled ? 'Mic on' : 'Muted' }}
                    </span>
                  </div>

                  <!-- Video Status -->
                  <div class="flex items-center space-x-1">
                    <svg
                      :class="[
                        'w-3 h-3',
                        participant.videoEnabled ? 'text-green-500' : 'text-gray-500'
                      ]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path v-if="participant.videoEnabled" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      <path v-else fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v.586l-4-4V4a2 2 0 00-2-2H6.414l-2.707-2.707zm3.586 3.586l7.414 7.414-1.121.561-2 1A1 1 0 0110 14V8.586l-2.707-2.707z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs text-gray-400">
                      {{ participant.videoEnabled ? 'Camera on' : 'Camera off' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Connection Status -->
              <div class="w-2 h-2 rounded-full bg-green-500" title="Connected"></div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm text-blue-300 font-medium">Tip</p>
                <p class="text-xs text-blue-200 mt-1">
                  Test your camera and microphone before joining. You can always change your settings during the meeting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
        <p class="text-red-200 text-sm">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { io } from 'socket.io-client'

const router = useRouter()
const route = useRoute()

// Refs
const previewVideoRef = ref(null)
const displayName = ref('')
const isVideoEnabled = ref(true)
const isAudioEnabled = ref(true)
const isJoining = ref(false)
const errorMessage = ref(null)
const existingParticipants = ref([])

// Device lists
const cameras = ref([])
const microphones = ref([])
const speakers = ref([])
const selectedCameraId = ref(null)
const selectedMicrophoneId = ref(null)
const selectedSpeakerId = ref(null)

// Media stream
let previewStream = null
let socket = null

// Route params
const meetingId = ref(route.params.id)
const initialName = ref(route.query.name || '')

// Computed
const userInitials = computed(() => {
  if (!displayName.value) return 'G'
  return displayName.value
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const getInitials = (name) => {
  if (!name) return 'G'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get available devices
const getDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    
    cameras.value = devices.filter(device => device.kind === 'videoinput')
    microphones.value = devices.filter(device => device.kind === 'audioinput')
    speakers.value = devices.filter(device => device.kind === 'audiooutput')

    // Select first device of each type by default
    if (cameras.value.length > 0 && !selectedCameraId.value) {
      selectedCameraId.value = cameras.value[0].deviceId
    }
    if (microphones.value.length > 0 && !selectedMicrophoneId.value) {
      selectedMicrophoneId.value = microphones.value[0].deviceId
    }
    if (speakers.value.length > 0 && !selectedSpeakerId.value) {
      selectedSpeakerId.value = speakers.value[0].deviceId
    }

    console.log('[PreJoin] Devices:', { 
      cameras: cameras.value.length, 
      microphones: microphones.value.length,
      speakers: speakers.value.length 
    })
  } catch (error) {
    console.error('[PreJoin] Error getting devices:', error)
    errorMessage.value = 'Failed to get media devices'
  }
}

// Start preview stream
const startPreview = async () => {
  try {
    const constraints = {
      video: cameras.value.length > 0 && isVideoEnabled.value
        ? { deviceId: selectedCameraId.value ? { exact: selectedCameraId.value } : undefined }
        : false,
      audio: microphones.value.length > 0 && isAudioEnabled.value
        ? { deviceId: selectedMicrophoneId.value ? { exact: selectedMicrophoneId.value } : undefined }
        : false
    }

    if (!constraints.video && !constraints.audio) {
      console.log('[PreJoin] No devices available for preview')
      return
    }

    previewStream = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (previewVideoRef.value && previewStream.getVideoTracks().length > 0) {
      previewVideoRef.value.srcObject = previewStream
    }

    console.log('[PreJoin] Preview started:', {
      video: previewStream.getVideoTracks().length > 0,
      audio: previewStream.getAudioTracks().length > 0
    })
  } catch (error) {
    console.error('[PreJoin] Error starting preview:', error)
    errorMessage.value = `Camera/microphone access denied: ${error.message}`
  }
}

// Stop preview stream
const stopPreview = () => {
  if (previewStream) {
    previewStream.getTracks().forEach(track => track.stop())
    previewStream = null
    console.log('[PreJoin] Preview stopped')
  }
}

// Toggle video
const toggleVideo = async () => {
  isVideoEnabled.value = !isVideoEnabled.value
  
  if (isVideoEnabled.value && cameras.value.length > 0) {
    await startPreview()
  } else if (previewStream) {
    const videoTrack = previewStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.stop()
      previewStream.removeTrack(videoTrack)
    }
  }
}

// Toggle audio
const toggleAudio = async () => {
  isAudioEnabled.value = !isAudioEnabled.value
  
  if (previewStream) {
    const audioTrack = previewStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = isAudioEnabled.value
    }
  }
}

// Change camera
const changeCamera = async () => {
  stopPreview()
  await startPreview()
}

// Change microphone
const changeMicrophone = async () => {
  stopPreview()
  await startPreview()
}

// Fetch existing participants
const fetchParticipants = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/meetings/${meetingId.value}/participants`)
    if (response.ok) {
      const data = await response.json()
      existingParticipants.value = data.participants || []
      console.log('[PreJoin] Existing participants:', existingParticipants.value.length)
    }
  } catch (error) {
    console.error('[PreJoin] Error fetching participants:', error)
    // Not a critical error, continue anyway
  }
}

// Connect to socket for real-time participant updates
const connectSocket = () => {
  const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  socket = io(socketUrl, {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('[PreJoin] Socket connected for preview')
    // Listen to room updates without joining
    socket.emit('preview-room', { meetingId: meetingId.value })
  })

  socket.on('room-participants-update', (data) => {
    console.log('[PreJoin] Participants updated:', data)
    if (data.participants) {
      existingParticipants.value = data.participants
    }
  })

  socket.on('disconnect', () => {
    console.log('[PreJoin] Socket disconnected')
  })
}

// Join meeting
const joinMeeting = async () => {
  if (!displayName.value.trim()) {
    errorMessage.value = 'Please enter your name'
    return
  }

  isJoining.value = true
  stopPreview()

  // Navigate to meeting with settings
  router.push({
    name: 'meeting',
    params: { id: meetingId.value },
    query: {
      name: displayName.value.trim(),
      video: isVideoEnabled.value ? 'true' : 'false',
      audio: isAudioEnabled.value ? 'true' : 'false',
      cameraId: selectedCameraId.value,
      microphoneId: selectedMicrophoneId.value,
      speakerId: selectedSpeakerId.value
    }
  })
}

// Lifecycle
onMounted(async () => {
  displayName.value = initialName.value || localStorage.getItem('userName') || ''
  
  // Check device availability first
  await getDevices()
  
  // Start preview
  await startPreview()
  
  // Fetch existing participants
  await fetchParticipants()
  
  // Connect socket for real-time updates
  connectSocket()
})

onUnmounted(() => {
  stopPreview()
  if (socket) {
    socket.disconnect()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #3C4043;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #5F6368;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6F7378;
}
</style>
