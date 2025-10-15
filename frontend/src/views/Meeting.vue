<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-white font-semibold text-lg">{{ appName }}</h1>
        <span class="text-gray-400 text-sm">{{ meetingId }}</span>
      </div>
      <div class="text-white text-sm">
        👥 {{ participantCount }} participants
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Video Grid -->
      <div class="flex-1 p-4">
        <div class="h-full flex items-center justify-center">
          <div class="text-center text-white">
            <div class="text-6xl mb-4">🎥</div>
            <h2 class="text-2xl font-semibold mb-2">Meeting Room</h2>
            <p class="text-gray-400 mb-6">WebRTC connection will be implemented here</p>
            <div class="bg-gray-800 rounded-lg p-6 inline-block">
              <p class="text-sm text-gray-300 mb-2">Meeting ID: {{ meetingId }}</p>
              <p class="text-sm text-gray-300">Participant: {{ userName }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Control Bar -->
    <footer class="bg-gray-800 px-4 py-4">
      <div class="flex items-center justify-center gap-4">
        <button
          @click="toggleAudio"
          :class="[
            'p-4 rounded-full transition-colors',
            isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          ]"
          title="Toggle Microphone"
        >
          <svg v-if="isAudioEnabled" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>

        <button
          @click="toggleVideo"
          :class="[
            'p-4 rounded-full transition-colors',
            isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          ]"
          title="Toggle Camera"
        >
          <svg v-if="isVideoEnabled" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>

        <button
          @click="leaveMeeting"
          class="p-4 px-8 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          title="Leave Meeting"
        >
          <span class="text-white font-semibold">Leave</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '../stores/meeting'
import { useParticipantsStore } from '../stores/participants'
import { useMediaStore } from '../stores/media'

const router = useRouter()
const route = useRoute()
const meetingStore = useMeetingStore()
const participantsStore = useParticipantsStore()
const mediaStore = useMediaStore()

const appName = import.meta.env.VITE_APP_NAME || 'Discus'
const meetingId = ref(route.params.id)
const userName = ref(route.query.name || 'Guest')
const participantCount = ref(1)

const isAudioEnabled = ref(route.query.audio === 'true')
const isVideoEnabled = ref(route.query.video === 'true')

onMounted(() => {
  meetingStore.joinMeeting(meetingId.value)
})

function toggleAudio() {
  isAudioEnabled.value = !isAudioEnabled.value
  mediaStore.toggleAudio()
}

function toggleVideo() {
  isVideoEnabled.value = !isVideoEnabled.value
  mediaStore.toggleVideo()
}

function leaveMeeting() {
  meetingStore.leaveMeeting()
  participantsStore.clearParticipants()
  router.push('/')
}
</script>
