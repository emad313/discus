<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-white font-semibold text-lg">{{ appName }}</h1>
        <span class="text-gray-400 text-sm">{{ meetingId }}</span>
      </div>
      <div class="text-white text-sm">
        👥 {{ totalParticipants }} participants
      </div>
    </header>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-600 text-white px-4 py-3 text-sm">
      {{ errorMessage }}
      <button @click="errorMessage = null" class="ml-4 underline">Dismiss</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center text-white">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-lg">Connecting to meeting...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="flex-1 flex overflow-hidden">
      <!-- Video Grid -->
      <div class="flex-1 p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full auto-rows-fr">
          <!-- Local Video -->
          <div class="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            <video
              ref="localVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
              :class="{ 'hidden': !hasVideo }"
            ></video>
            <div v-if="!hasVideo" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-2">👤</div>
                <p class="text-white text-sm">{{ userName }} (You)</p>
              </div>
            </div>
            <div class="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs">
              {{ userName }} (You)
            </div>
            <div v-if="!hasAudio" class="absolute top-2 right-2 bg-red-600 p-1 rounded">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
          </div>

          <!-- Remote Videos -->
          <div
            v-for="(stream, participantId) in remoteStreams"
            :key="participantId"
            class="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
          >
            <video
              :ref="el => setRemoteVideoRef(el, participantId)"
              autoplay
              playsinline
              class="w-full h-full object-cover"
            ></video>
            <div class="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs">
              Participant {{ participantId.slice(0, 8) }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Control Bar -->
    <footer class="bg-gray-800 px-4 py-4">
      <div class="flex items-center justify-center gap-4">
        <button
          @click="handleToggleAudio"
          :class="[
            'p-4 rounded-full transition-colors',
            hasAudio ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          ]"
          :disabled="isLoading"
          title="Toggle Microphone"
        >
          <svg v-if="hasAudio" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>

        <button
          @click="handleToggleVideo"
          :class="[
            'p-4 rounded-full transition-colors',
            hasVideo ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          ]"
          :disabled="isLoading"
          title="Toggle Camera"
        >
          <svg v-if="hasVideo" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>

        <button
          @click="handleScreenShare"
          :class="[
            'p-4 rounded-full transition-colors',
            hasScreenShare ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          ]"
          :disabled="isLoading"
          title="Share Screen"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          @click="handleLeaveMeeting"
          class="p-4 px-8 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          :disabled="isLoading"
          title="Leave Meeting"
        >
          <span class="text-white font-semibold">Leave</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWebRTC } from '../composables/useWebRTC'
import { useMediaStream } from '../composables/useMediaStream'

const router = useRouter()
const route = useRoute()

// Refs
const localVideoRef = ref(null)
const remoteVideoRefs = new Map()
const isLoading = ref(true)
const errorMessage = ref(null)

// Route params
const appName = import.meta.env.VITE_APP_NAME || 'Discus'
const meetingId = ref(route.params.id)
const userName = ref(route.query.name || 'Guest')
const initialVideo = route.query.video !== 'false'
const initialAudio = route.query.audio !== 'false'

// Initialize composables
const {
  initialize: initWebRTC,
  joinRoom,
  produce,
  leaveRoom,
  remoteStreams,
  isConnected,
  participants,
} = useWebRTC()

const {
  localStream,
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  hasVideo,
  hasAudio,
  hasScreenShare,
  requestPermissions,
  startLocalStream,
  stopLocalStream,
  toggleVideo,
  toggleAudio,
  startScreenShare,
  stopScreenShare,
  getVideoTrack,
  getAudioTrack,
  getScreenTrack,
} = useMediaStream()

// Computed
const totalParticipants = computed(() => {
  return 1 + (participants.value?.size || 0) // 1 (local) + remote participants
})

// Set remote video ref
const setRemoteVideoRef = (el, participantId) => {
  if (el) {
    remoteVideoRefs.set(participantId, el)
  }
}

// Initialize meeting
const initializeMeeting = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null

    // Request media permissions (but don't fail if denied)
    console.log('[Meeting] Requesting permissions...')
    try {
      await requestPermissions(initialVideo, initialAudio)
    } catch (permError) {
      console.warn('[Meeting] Media permission error (continuing anyway):', permError.message)
      errorMessage.value = permError.message
      // Continue without media - user can still join meeting
    }

    // Start local stream if permissions granted
    if (permissionsGranted.value.camera || permissionsGranted.value.microphone) {
      try {
        console.log('[Meeting] Starting local stream...')
        await startLocalStream(
          initialVideo && permissionsGranted.value.camera,
          initialAudio && permissionsGranted.value.microphone
        )
      } catch (streamError) {
        console.warn('[Meeting] Failed to start stream (continuing):', streamError.message)
        // Continue without stream
      }
    } else {
      console.log('[Meeting] No media permissions, joining without camera/mic')
    }

    // Initialize WebRTC
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    console.log('[Meeting] Initializing WebRTC...', socketUrl)
    await initWebRTC(socketUrl)

    // Join room
    console.log('[Meeting] Joining room...', meetingId.value, userName.value)
    await joinRoom(meetingId.value, userName.value)

    // Produce video track if enabled
    if (hasVideo.value) {
      const videoTrack = getVideoTrack()
      if (videoTrack) {
        try {
          console.log('[Meeting] Producing video track...')
          await produce(videoTrack, 'video')
        } catch (produceError) {
          console.error('[Meeting] Failed to produce video:', produceError)
        }
      }
    }

    // Produce audio track if enabled
    if (hasAudio.value) {
      const audioTrack = getAudioTrack()
      if (audioTrack) {
        try {
          console.log('[Meeting] Producing audio track...')
          await produce(audioTrack, 'audio')
        } catch (produceError) {
          console.error('[Meeting] Failed to produce audio:', produceError)
        }
      }
    }

    isLoading.value = false
    console.log('[Meeting] Initialization complete!')
  } catch (error) {
    console.error('[Meeting] Initialization failed:', error)
    errorMessage.value = error.message || 'Failed to join meeting'
    isLoading.value = false
  }
}

// Handle toggle audio
const handleToggleAudio = async () => {
  try {
    await toggleAudio()
    
    if (hasAudio.value) {
      // Produce new audio track
      const audioTrack = getAudioTrack()
      if (audioTrack) {
        await produce(audioTrack, 'audio')
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle audio:', error)
    errorMessage.value = 'Failed to toggle microphone'
  }
}

// Handle toggle video
const handleToggleVideo = async () => {
  try {
    await toggleVideo()
    
    if (hasVideo.value) {
      // Produce new video track
      const videoTrack = getVideoTrack()
      if (videoTrack) {
        await produce(videoTrack, 'video')
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle video:', error)
    errorMessage.value = 'Failed to toggle camera'
  }
}

// Handle screen share
const handleScreenShare = async () => {
  try {
    if (hasScreenShare.value) {
      // Stop screen sharing
      stopScreenShare()
    } else {
      // Start screen sharing
      await startScreenShare()
      const screenTrack = getScreenTrack()
      if (screenTrack) {
        await produce(screenTrack, 'screen')
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle screen share:', error)
    errorMessage.value = 'Failed to share screen'
  }
}

// Handle leave meeting
const handleLeaveMeeting = async () => {
  try {
    await leaveRoom()
    stopLocalStream()
    router.push('/')
  } catch (error) {
    console.error('[Meeting] Failed to leave meeting:', error)
    router.push('/')
  }
}

// Watch local stream and attach to video element
watch(localStream, (stream) => {
  nextTick(() => {
    if (localVideoRef.value && stream) {
      localVideoRef.value.srcObject = stream
    }
  })
})

// Watch remote streams and attach to video elements
watch(remoteStreams, (streams) => {
  nextTick(() => {
    for (const [participantId, stream] of streams.entries()) {
      const videoEl = remoteVideoRefs.get(participantId)
      if (videoEl && stream) {
        videoEl.srcObject = stream
      }
    }
  })
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  initializeMeeting()
})

onBeforeUnmount(() => {
  leaveRoom()
  stopLocalStream()
})
</script>
