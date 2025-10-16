<template>
  <div class="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
    <div class="max-w-md w-full mx-4">
      <!-- Waiting Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 text-center">
        <!-- Animated Icon -->
        <div class="mb-6 relative">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <!-- Ripple effect -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Waiting for host to let you in
        </h2>

        <!-- Description -->
        <p class="text-gray-600 mb-6">
          {{ hostName || 'The host' }} will admit you to the meeting soon
        </p>

        <!-- Meeting Info -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Meeting ID</span>
            <span class="font-mono font-semibold text-gray-800">{{ meetingId }}</span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-500">Your name</span>
            <span class="font-semibold text-gray-800">{{ userName }}</span>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div class="flex justify-center mb-6">
          <div class="flex gap-2">
            <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>

        <!-- Status Message -->
        <p class="text-sm text-gray-500 mb-6">
          {{ statusMessage }}
        </p>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="retryJoin"
            v-if="showRetry"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <button
            @click="leaveWaitingRoom"
            class="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-200 transition-colors"
          >
            Leave Waiting Room
          </button>
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          💡 The host has been notified of your request to join
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  meetingId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  hostName: {
    type: String,
    default: ''
  },
  socket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['admitted', 'rejected', 'cancel'])

const router = useRouter()
const toastStore = useToastStore()

const statusMessage = ref('Knocking on the meeting door...')
const showRetry = ref(false)
let statusInterval = null

const statusMessages = [
  'Knocking on the meeting door...',
  'Waiting for host response...',
  'Host will admit you shortly...',
  'Please wait a moment...',
]

let messageIndex = 0

onMounted(() => {
  // Listen for admission
  props.socket.on('admitted-to-meeting', handleAdmitted)
  
  // Listen for rejection
  props.socket.on('rejected-from-meeting', handleRejected)
  
  // Rotate status messages
  statusInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % statusMessages.length
    statusMessage.value = statusMessages[messageIndex]
  }, 3000)

  console.log('[WaitingRoom] Mounted, waiting for host...')
})

onBeforeUnmount(() => {
  // Clean up listeners
  props.socket.off('admitted-to-meeting', handleAdmitted)
  props.socket.off('rejected-from-meeting', handleRejected)
  
  if (statusInterval) {
    clearInterval(statusInterval)
  }

  console.log('[WaitingRoom] Unmounted')
})

function handleAdmitted({ meetingId }) {
  console.log('[WaitingRoom] Admitted to meeting:', meetingId)
  toastStore.success('You have been admitted to the meeting!')
  emit('admitted', meetingId)
}

function handleRejected({ message }) {
  console.log('[WaitingRoom] Rejected from meeting:', message)
  toastStore.error(message || 'The host has denied your request to join')
  showRetry.value = true
  statusMessage.value = message || 'Access denied by host'
  
  // Auto-redirect after 3 seconds
  setTimeout(() => {
    emit('rejected')
    router.push('/')
  }, 3000)
}

function retryJoin() {
  emit('retry')
}

function leaveWaitingRoom() {
  emit('cancel')
  router.push('/')
}
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
