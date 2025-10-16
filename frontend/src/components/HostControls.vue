<template>
  <div v-if="isHost" class="host-controls">
    <!-- Host Controls Panel -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="font-semibold text-gray-800">Host Controls</span>
        </div>
        
        <button 
          @click="showControls = !showControls"
          class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg 
            class="w-5 h-5 text-gray-600 transition-transform"
            :class="{ 'rotate-180': !showControls }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div v-show="showControls" class="space-y-3">
        <!-- Meeting Lock Toggle -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" :class="isLocked ? 'text-red-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="isLocked" fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              <path v-else d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-800">Meeting Lock</p>
              <p class="text-xs text-gray-500">{{ isLocked ? 'Meeting is locked' : 'Anyone can join' }}</p>
            </div>
          </div>
          <button
            @click="toggleLock"
            :disabled="loading"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="isLocked ? 'bg-red-600' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isLocked ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Mute All Button -->
        <button
          @click="muteAll"
          :disabled="loading || participantCount <= 1"
          class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-800">Mute All</p>
              <p class="text-xs text-gray-500">Mute all participants</p>
            </div>
          </div>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Waiting Room (if anyone waiting) -->
        <div 
          v-if="waitingParticipants.length > 0"
          class="p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-amber-800">Waiting Room ({{ waitingParticipants.length }})</span>
            </div>
          </div>

          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div 
              v-for="participant in waitingParticipants" 
              :key="participant.peerId"
              class="flex items-center justify-between p-2 bg-white rounded-lg"
            >
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ participant.userName.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-800">{{ participant.userName }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="admitParticipant(participant.peerId)"
                  class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Admit
                </button>
                <button
                  @click="rejectParticipant(participant.peerId)"
                  class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="waitingParticipants.length > 1"
            @click="admitAll"
            class="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Admit All ({{ waitingParticipants.length }})
          </button>
        </div>

        <!-- End Meeting for All -->
        <button
          @click="endMeetingForAll"
          class="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <div class="text-left">
              <p class="text-sm font-medium text-red-600">End Meeting for All</p>
              <p class="text-xs text-red-500">Close the meeting for everyone</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  isHost: {
    type: Boolean,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  waitingParticipants: {
    type: Array,
    default: () => []
  },
  participantCount: {
    type: Number,
    default: 0
  },
  socket: {
    type: Object,
    required: true
  },
  meetingId: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'lock-changed',
  'mute-all',
  'admit-participant',
  'reject-participant',
  'admit-all',
  'end-meeting'
])

const toastStore = useToastStore()
const showControls = ref(true)
const loading = ref(false)

function toggleLock() {
  if (loading.value) return
  
  loading.value = true
  const event = props.isLocked ? 'unlock-meeting' : 'lock-meeting'
  
  props.socket.emit(event, { meetingId: props.meetingId }, (response) => {
    loading.value = false
    
    if (response.success) {
      const message = response.isLocked ? 'Meeting locked. New participants need admission.' : 'Meeting unlocked. Anyone with the link can join.'
      toastStore.success(message)
      emit('lock-changed', response.isLocked)
    } else {
      toastStore.error(response.error || 'Failed to change lock status')
    }
  })
}

function muteAll() {
  if (loading.value || props.participantCount <= 1) return
  
  if (!confirm('Mute all participants? They can unmute themselves afterwards.')) return
  
  loading.value = true
  
  props.socket.emit('mute-all', { meetingId: props.meetingId }, (response) => {
    loading.value = false
    
    if (response.success) {
      toastStore.success('All participants have been muted')
      emit('mute-all')
    } else {
      toastStore.error(response.error || 'Failed to mute all participants')
    }
  })
}

function admitParticipant(peerId) {
  props.socket.emit('admit-participant', { meetingId: props.meetingId, peerId }, (response) => {
    if (response.success) {
      toastStore.success('Participant admitted')
      emit('admit-participant', peerId)
    } else {
      toastStore.error(response.error || 'Failed to admit participant')
    }
  })
}

function rejectParticipant(peerId) {
  props.socket.emit('reject-participant', { meetingId: props.meetingId, peerId }, (response) => {
    if (response.success) {
      toastStore.info('Participant rejected')
      emit('reject-participant', peerId)
    } else {
      toastStore.error(response.error || 'Failed to reject participant')
    }
  })
}

function admitAll() {
  if (!confirm(`Admit all ${props.waitingParticipants.length} waiting participants?`)) return
  
  props.waitingParticipants.forEach(participant => {
    admitParticipant(participant.peerId)
  })
  
  emit('admit-all')
}

function endMeetingForAll() {
  if (!confirm('End the meeting for everyone? This action cannot be undone.')) return
  
  toastStore.warning('Ending meeting for all participants...')
  emit('end-meeting')
}
</script>

<style scoped>
.host-controls {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
