<template>
  <div class="h-screen flex flex-col bg-[#202124] relative">
    <!-- Top Bar -->
    <header class="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span class="text-white text-lg font-bold">D</span>
          </div>
          <div>
            <div class="text-white font-medium text-base">{{ meetingId }}</div>
            <div class="text-gray-300 text-xs flex items-center gap-2">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                {{ currentTime }}
              </span>
              <span>|</span>
              <span>{{ totalParticipants }} {{ totalParticipants === 1 ? 'participant' : 'participants' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Meeting Info Button -->
        <button
          @click="showMeetingInfo = !showMeetingInfo"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white text-sm font-medium"
          title="Meeting details"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Error Message Toast -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <div v-if="errorMessage" class="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">{{ errorMessage }}</span>
        <button @click="errorMessage = null" class="ml-2 hover:bg-red-700 p-1 rounded">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>
        <p class="text-white text-lg font-medium mb-2">Joining meeting...</p>
        <p class="text-gray-400 text-sm">Setting up your audio and video</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="flex-1 flex items-center justify-center p-6 pt-24 pb-32">
      <!-- Video Grid -->
      <div class="w-full h-full max-w-[1600px]">
        <div 
          :class="[
            'grid gap-4 h-full w-full',
            getGridClass
          ]"
        >
          <!-- Local Video -->
          <div 
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl group transition-all duration-300"
            :class="{'ring-4 ring-blue-500': isLocalActive}"
          >
            <video
              ref="localVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
            ></video>
            <!-- No Stream Placeholder -->
            <div v-if="!localStream" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div class="text-center">
                <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-4xl font-bold">{{ userName.charAt(0).toUpperCase() }}</span>
                </div>
                <p class="text-white text-lg font-medium">{{ userName }}</p>
              </div>
            </div>
            <!-- Name Badge -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium text-sm">{{ userName }} (You)</span>
                  <div v-if="hasAudio" class="flex items-center gap-1">
                    <div class="w-1 h-3 bg-green-500 rounded animate-pulse"></div>
                    <div class="w-1 h-4 bg-green-500 rounded animate-pulse" style="animation-delay: 0.1s"></div>
                    <div class="w-1 h-2 bg-green-500 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <!-- Connection Quality -->
                  <div class="flex items-center gap-1" title="Connection quality">
                    <div class="w-1 h-2 bg-green-500 rounded"></div>
                    <div class="w-1 h-3 bg-green-500 rounded"></div>
                    <div class="w-1 h-4 bg-green-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Muted Indicator -->
            <div v-if="!hasAudio" class="absolute top-3 right-3 bg-red-600 p-2 rounded-full shadow-lg">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Remote Videos -->
          <div
            v-for="[participantId, stream] in remoteStreams"
            :key="participantId"
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl group transition-all duration-300"
          >
            <video
              :ref="el => setRemoteVideoRef(el, participantId)"
              autoplay
              playsinline
              class="w-full h-full object-cover"
            ></video>
            <!-- Name Badge -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium text-sm">
                    {{ participants.get(participantId)?.userName || `Participant ${participantId.slice(0, 8)}` }}
                  </span>
                  <div class="flex items-center gap-1">
                    <div class="w-1 h-3 bg-green-500 rounded animate-pulse"></div>
                    <div class="w-1 h-4 bg-green-500 rounded animate-pulse" style="animation-delay: 0.1s"></div>
                    <div class="w-1 h-2 bg-green-500 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
                <div class="flex items-center gap-1" title="Connection quality">
                  <div class="w-1 h-2 bg-green-500 rounded"></div>
                  <div class="w-1 h-3 bg-green-500 rounded"></div>
                  <div class="w-1 h-4 bg-green-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Control Bar -->
    <footer class="absolute bottom-0 left-0 right-0 z-20 pb-8">
      <div class="max-w-2xl mx-auto px-6">
        <div class="bg-[#3C4043] rounded-full shadow-2xl px-6 py-4 backdrop-blur-xl">
          <div class="flex items-center justify-between gap-2">
            <!-- Left Controls -->
            <div class="flex items-center gap-2">
              <!-- Meeting Time -->
              <div class="px-3 py-2 text-white text-sm font-medium">
                {{ meetingDuration }}
              </div>
            </div>

            <!-- Center Controls -->
            <div class="flex items-center gap-3">
              <!-- Microphone -->
              <button
                @click="handleToggleAudio"
                :class="[
                  'p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasAudio ? 'bg-[#5F6368] hover:bg-[#6F7378]' : 'bg-red-600 hover:bg-red-700'
                ]"
                :disabled="isLoading"
                :title="hasAudio ? 'Turn off microphone' : 'Turn on microphone'"
              >
                <svg v-if="hasAudio" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Camera -->
              <button
                @click="handleToggleVideo"
                :class="[
                  'p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasVideo ? 'bg-[#5F6368] hover:bg-[#6F7378]' : 'bg-red-600 hover:bg-red-700'
                ]"
                :disabled="isLoading"
                :title="hasVideo ? 'Turn off camera' : 'Turn on camera'"
              >
                <svg v-if="hasVideo" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>

              <!-- Screen Share -->
              <button
                @click="handleScreenShare"
                :class="[
                  'p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasScreenShare ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#5F6368] hover:bg-[#6F7378]'
                ]"
                :disabled="isLoading"
                :title="hasScreenShare ? 'Stop sharing' : 'Share screen'"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              <!-- More Options -->
              <button
                class="p-4 rounded-full bg-[#5F6368] hover:bg-[#6F7378] transition-all duration-200 transform hover:scale-110"
                title="More options"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              <!-- Leave Meeting -->
              <button
                @click="handleLeaveMeeting"
                class="p-4 px-8 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                :disabled="isLoading"
                title="Leave meeting"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Right Controls -->
            <div class="flex items-center gap-2">
              <!-- Chat -->
              <button
                @click="chatStore.toggleChat()"
                class="relative p-3 rounded-full bg-[#5F6368] hover:bg-[#6F7378] transition-all"
                title="Toggle chat"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <!-- Unread Badge -->
                <span
                  v-if="chatStore.unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ chatStore.unreadCount > 9 ? '9+' : chatStore.unreadCount }}
                </span>
              </button>
              
              <!-- Participants -->
              <button
                @click="showParticipants = !showParticipants"
                class="p-3 rounded-full bg-[#5F6368] hover:bg-[#6F7378] transition-all"
                :class="{ 'bg-blue-600 hover:bg-blue-700': showParticipants }"
                title="Show participants"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Chat Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <ChatPanel
        v-if="chatStore.chatOpen"
        :current-user-id="socket?.id || ''"
        :participant-count="totalParticipants"
        @send-message="handleSendMessage"
        @typing-start="handleChatTypingStart"
        @typing-stop="handleChatTypingStop"
        @close="chatStore.closeChat()"
      />
    </transition>

    <!-- Participants Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <ParticipantsPanel
        v-if="showParticipants"
        :participant-count="totalParticipants"
        :remote-participants="participants"
        :local-user-name="userName"
        :meeting-id="meetingId"
        :is-audio-enabled="isAudioEnabled"
        :is-video-enabled="isVideoEnabled"
        @close="showParticipants = false"
        @update-name="updateUserName"
      />
    </transition>

    <!-- Meeting Info Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <div v-if="showMeetingInfo" class="absolute top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-30 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Meeting details</h2>
          <button @click="showMeetingInfo = false" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-600 block mb-1">Meeting ID</label>
            <div class="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
              <span class="text-sm font-mono flex-1">{{ meetingId }}</span>
              <button 
                @click="copyMeetingId"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label class="text-sm text-gray-600 block mb-1">Your name</label>
            <div class="bg-gray-100 p-3 rounded-lg text-sm">{{ userName }}</div>
          </div>
          <div>
            <label class="text-sm text-gray-600 block mb-1">Duration</label>
            <div class="bg-gray-100 p-3 rounded-lg text-sm">{{ meetingDuration }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWebRTC } from '../composables/useWebRTC'
import { useMediaStream } from '../composables/useMediaStream'
import { useChat } from '../composables/useChat'
import { useChatStore } from '../stores/chat'
import ChatPanel from '../components/ChatPanel.vue'
import ParticipantsPanel from '../components/ParticipantsPanel.vue'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

// Refs
const localVideoRef = ref(null)
const remoteVideoRefs = new Map()
const isLoading = ref(true)
const errorMessage = ref(null)
const showMeetingInfo = ref(false)
const showParticipants = ref(false)
const currentTime = ref('')
const meetingStartTime = ref(Date.now())
const meetingDuration = ref('00:00')
const isLocalActive = ref(false)

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
  consumePendingProducers,
  leaveRoom,
  remoteStreams,
  isConnected,
  participants,
  socket,
} = useWebRTC()

const {
  localStream,
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  hasVideo,
  hasAudio,
  hasScreenShare,
  permissionsGranted,
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

// Initialize chat
const {
  sendMessage,
  handleTypingStart,
  handleTypingStop,
  setupChatListeners,
  cleanupChatListeners,
} = useChat(socket, meetingId.value)

// Computed
const totalParticipants = computed(() => {
  return 1 + (participants.value?.size || 0) // 1 (local) + remote participants
})

const getGridClass = computed(() => {
  const total = totalParticipants.value
  if (total === 1) return 'grid-cols-1'
  if (total === 2) return 'grid-cols-1 lg:grid-cols-2'
  if (total <= 4) return 'grid-cols-2'
  if (total <= 6) return 'grid-cols-2 lg:grid-cols-3'
  if (total <= 9) return 'grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})

// Copy meeting ID
const copyMeetingId = () => {
  navigator.clipboard.writeText(meetingId.value)
    .then(() => {
      errorMessage.value = 'Meeting ID copied to clipboard!'
      setTimeout(() => { errorMessage.value = null }, 2000)
    })
    .catch(() => {
      errorMessage.value = 'Failed to copy meeting ID'
    })
}

// Update time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
  
  // Update meeting duration
  const duration = Math.floor((Date.now() - meetingStartTime.value) / 1000)
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  if (hours > 0) {
    meetingDuration.value = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    meetingDuration.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

// Set remote video ref
const setRemoteVideoRef = (el, participantId) => {
  if (el) {
    console.log('[Meeting] Video ref created for peer:', participantId)
    remoteVideoRefs.set(participantId, el)
    
    // If we already have a stream for this participant, attach it now
    const stream = remoteStreams.value.get(participantId)
    if (stream) {
      console.log('[Meeting] Attaching existing stream to new video element for peer:', participantId)
      el.srcObject = stream
      el.play()
        .then(() => console.log('[Meeting] ✅ Video playing for peer:', participantId))
        .catch(e => console.error('[Meeting] ❌ Play error:', e))
    }
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
        console.log('[Meeting] Local stream started successfully')
        // Note: Will attach to video element after loading completes
      } catch (streamError) {
        console.warn('[Meeting] Failed to start stream (continuing):', streamError.message)
        // Continue without stream
      }
    } else {
      console.log('[Meeting] No media permissions, joining without camera/mic')
    }

    // Initialize WebRTC
    // Use empty string to connect to same origin (nginx will proxy to backend)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
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

    // Consume existing producers from peers who joined before us
    try {
      console.log('[Meeting] Consuming existing producers from other peers...')
      await consumePendingProducers()
    } catch (consumeError) {
      console.error('[Meeting] Failed to consume pending producers:', consumeError)
    }

    isLoading.value = false
    console.log('[Meeting] Initialization complete!')
    
    // Setup chat listeners
    setupChatListeners()
    
    // Now that loading is false, the video element should be rendered
    // Attach the stream to the video element
    await nextTick()
    if (localVideoRef.value && localStream.value) {
      console.log('[Meeting] Post-init: Attaching stream to now-visible video element')
      localVideoRef.value.srcObject = localStream.value
      await localVideoRef.value.play().catch(e => console.log('[Meeting] Post-init play error:', e.message))
    }
  } catch (error) {
    console.error('[Meeting] Initialization failed:', error)
    errorMessage.value = error.message || 'Failed to join meeting'
    isLoading.value = false
  }
}

// Chat handlers
const handleSendMessage = async (message) => {
  try {
    await sendMessage(message)
  } catch (error) {
    console.error('[Meeting] Failed to send message:', error)
    errorMessage.value = 'Failed to send message'
  }
}

const handleChatTypingStart = () => {
  handleTypingStart()
}

const handleChatTypingStop = () => {
  handleTypingStop()
}

// Update user name
const updateUserName = (newName) => {
  userName.value = newName
  console.log('[Meeting] User name updated to:', newName)
  // TODO: Emit socket event to update name for other participants
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
      console.log('[Meeting] Watch: Attaching local stream to video element')
      console.log('[Meeting] Watch: Stream active?', stream.active)
      console.log('[Meeting] Watch: Video tracks:', stream.getVideoTracks().map(t => ({
        id: t.id,
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })))
      localVideoRef.value.srcObject = stream
      // Ensure video plays
      localVideoRef.value.play()
        .then(() => console.log('[Meeting] Watch: Video playing successfully'))
        .catch(e => console.log('[Meeting] Watch: Video autoplay error:', e.message))
    } else {
      console.log('[Meeting] Watch: Missing ref or stream', {
        hasRef: !!localVideoRef.value,
        hasStream: !!stream
      })
    }
  })
}, { immediate: true })

// Watch remote streams and attach to video elements
watch(remoteStreams, (streams) => {
  // Use double nextTick to ensure DOM is fully updated with new video elements
  nextTick(() => {
    nextTick(() => {
      console.log('[Meeting] ===== Remote streams updated =====')
      console.log('[Meeting] Total remote streams:', streams.size)
      console.log('[Meeting] Remote video refs available:', remoteVideoRefs.size)
      
      for (const [participantId, stream] of streams.entries()) {
        const videoEl = remoteVideoRefs.get(participantId)
        console.log('[Meeting] Processing peer:', participantId)
        console.log('[Meeting]   - Has video element?', !!videoEl)
        console.log('[Meeting]   - Has stream?', !!stream)
        
        if (videoEl && stream) {
          const tracks = stream.getTracks()
          console.log('[Meeting]   - Stream ID:', stream.id)
          console.log('[Meeting]   - Stream active?', stream.active)
          console.log('[Meeting]   - Total tracks:', tracks.length)
          tracks.forEach(track => {
            console.log(`[Meeting]   - Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}, id: ${track.id}`)
          })
          
          console.log('[Meeting]   - Setting srcObject...')
          videoEl.srcObject = stream
          
          console.log('[Meeting]   - Video element ready state:', videoEl.readyState)
          console.log('[Meeting]   - Video element paused?', videoEl.paused)
          
          videoEl.play()
            .then(() => {
              console.log('[Meeting]   ✅ Video playing successfully for peer:', participantId)
              console.log('[Meeting]   - Video dimensions:', videoEl.videoWidth, 'x', videoEl.videoHeight)
            })
            .catch(e => console.error('[Meeting]   ❌ Video play error:', e))
        } else {
          if (!videoEl) {
            console.log('[Meeting]   ⚠️ No video element found for peer:', participantId)
            console.log('[Meeting]   ⚠️ Will retry after next render cycle...')
            // Retry after another tick to catch late-rendered elements
            setTimeout(() => {
              const retryEl = remoteVideoRefs.get(participantId)
              if (retryEl && stream) {
                console.log('[Meeting]   ✅ Found video element on retry for peer:', participantId)
                retryEl.srcObject = stream
                retryEl.play()
                  .then(() => console.log('[Meeting]   ✅ Video playing after retry'))
                  .catch(e => console.error('[Meeting]   ❌ Retry play error:', e))
              }
            }, 100)
          }
          if (!stream) console.log('[Meeting]   ⚠️ No stream found for peer:', participantId)
        }
      }
      console.log('[Meeting] ===== End remote streams update =====')
    })
  })
}, { deep: true, immediate: true })

// Lifecycle hooks
onMounted(() => {
  initializeMeeting()
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    clearInterval(timeInterval)
  })
})

onBeforeUnmount(() => {
  cleanupChatListeners()
  chatStore.clearMessages()
  leaveRoom()
  stopLocalStream()
})
</script>
