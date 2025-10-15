<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Join Meeting</h1>
        <p class="text-gray-600">{{ meetingId }}</p>
      </div>

      <form @submit.prevent="handleJoin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            v-model="userName"
            type="text"
            placeholder="Enter your name"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Audio and Video
          </label>
          <div class="space-y-3">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="joinWithVideo"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-gray-700">Join with camera on</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="joinWithAudio"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-gray-700">Join with microphone on</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
        >
          Join Now
        </button>

        <button
          type="button"
          @click="goBack"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const meetingId = ref(route.params.id || '')
const userName = ref('')
const joinWithVideo = ref(true)
const joinWithAudio = ref(true)

function handleJoin() {
  if (userName.value.trim()) {
    router.push({
      name: 'meeting',
      params: { id: meetingId.value },
      query: {
        name: userName.value,
        video: joinWithVideo.value,
        audio: joinWithAudio.value
      }
    })
  }
}

function goBack() {
  router.push('/')
}
</script>
