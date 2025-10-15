<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-6xl font-bold text-gray-800 mb-4">
          {{ appName }}
        </h1>
        <p class="text-xl text-gray-600">
          Free, open-source video conferencing for everyone
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- New Meeting -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Start a new meeting</h2>
            <button
              @click="createNewMeeting"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              New Meeting
            </button>
            <p class="text-sm text-gray-500 text-center">
              Instant meeting ready to use
            </p>
          </div>

          <!-- Join Meeting -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Join a meeting</h2>
            <div class="flex gap-2">
              <input
                v-model="meetingCode"
                type="text"
                placeholder="Enter meeting code"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="joinMeeting"
              />
              <button
                @click="joinMeeting"
                :disabled="!meetingCode"
                class="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
            <p class="text-sm text-gray-500 text-center">
              Enter the code shared with you
            </p>
          </div>
        </div>

        <!-- Features -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div class="text-blue-600 text-3xl mb-2">🎥</div>
              <h3 class="font-semibold text-gray-800 mb-1">HD Video Quality</h3>
              <p class="text-sm text-gray-600">Crystal clear 720p video</p>
            </div>
            <div>
              <div class="text-blue-600 text-3xl mb-2">👥</div>
              <h3 class="font-semibold text-gray-800 mb-1">100+ Participants</h3>
              <p class="text-sm text-gray-600">Host large meetings easily</p>
            </div>
            <div>
              <div class="text-blue-600 text-3xl mb-2">🔒</div>
              <h3 class="font-semibold text-gray-800 mb-1">Secure & Private</h3>
              <p class="text-sm text-gray-600">Your data stays private</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-gray-600">
        <p class="text-sm">
          Open-source project • No login required • 100% free
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const meetingCode = ref('')
const appName = import.meta.env.VITE_APP_NAME || 'Discus'

function createNewMeeting() {
  // Generate a random meeting ID
  const meetingId = generateMeetingId()
  router.push(`/meeting/${meetingId}`)
}

function joinMeeting() {
  if (meetingCode.value.trim()) {
    router.push(`/join/${meetingCode.value.trim()}`)
  }
}

function generateMeetingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
</script>
