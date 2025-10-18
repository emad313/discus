<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <header class="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-200">
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <span class="text-white text-lg sm:text-xl font-bold">D</span>
        </div>
        <span class="text-xl sm:text-2xl font-medium text-gray-800">Discus</span>
      </div>
      <button @click="goBack" class="text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium">
        ← Back to home
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-12">
      <div class="max-w-2xl w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
          <!-- Left Side - Preview -->
          <div class="space-y-4 sm:space-y-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-medium text-gray-800 mb-2">Ready to join?</h1>
              <p class="text-sm sm:text-base text-gray-600">Meeting: <span class="font-mono text-xs sm:text-sm break-all">{{ meetingId }}</span></p>
            </div>

            <!-- Video Preview -->
            <div class="relative bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden aspect-video shadow-lg sm:shadow-xl">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 sm:w-24 sm:h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span class="text-white text-2xl sm:text-4xl font-bold">
                      {{ userName ? userName.charAt(0).toUpperCase() : '?' }}
                    </span>
                  </div>
                  <p class="text-white text-base sm:text-lg">{{ userName || 'Your preview' }}</p>
                </div>
              </div>

              <!-- Controls overlay -->
              <div class="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
                <button
                  @click="joinWithVideo = !joinWithVideo"
                  :class="[
                    'p-3 sm:p-4 rounded-full transition-all',
                    joinWithVideo ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  ]"
                >
                  <svg v-if="joinWithVideo" class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
                <button
                  @click="joinWithAudio = !joinWithAudio"
                  :class="[
                    'p-3 sm:p-4 rounded-full transition-all',
                    joinWithAudio ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  ]"
                >
                  <svg v-if="joinWithAudio" class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Status indicators -->
            <div class="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <div :class="['w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full', joinWithVideo ? 'bg-green-500' : 'bg-red-500']"></div>
                <span class="text-gray-600">Camera {{ joinWithVideo ? 'on' : 'off' }}</span>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2">
                <div :class="['w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full', joinWithAudio ? 'bg-green-500' : 'bg-red-500']"></div>
                <span class="text-gray-600">Mic {{ joinWithAudio ? 'on' : 'off' }}</span>
              </div>
            </div>
          </div>

          <!-- Right Side - Form -->
          <div class="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-200">
            <form @submit.prevent="handleJoin" class="space-y-4 sm:space-y-6">
              <div>
                <h2 class="text-xl sm:text-2xl font-medium text-gray-800 mb-4 sm:mb-6">Enter your details</h2>
                
                <div class="space-y-3 sm:space-y-4">
                  <div>
                    <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Your name
                    </label>
                    <input
                      v-model="userName"
                      type="text"
                      placeholder="John Doe"
                      required
                      class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      autofocus
                    />
                    <p class="text-[10px] sm:text-xs text-gray-500 mt-1">This is how others will see you</p>
                  </div>

                  <div class="pt-3 sm:pt-4 border-t border-gray-200">
                    <p class="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Before you join</p>
                    <div class="space-y-2">
                      <label class="flex items-start gap-2 sm:gap-3 cursor-pointer group">
                        <input
                          v-model="joinWithVideo"
                          type="checkbox"
                          class="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <div class="flex-1">
                          <span class="text-xs sm:text-sm text-gray-700 group-hover:text-gray-900">Turn on camera</span>
                          <p class="text-[10px] sm:text-xs text-gray-500">Show your video to others</p>
                        </div>
                      </label>
                      <label class="flex items-start gap-2 sm:gap-3 cursor-pointer group">
                        <input
                          v-model="joinWithAudio"
                          type="checkbox"
                          class="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <div class="flex-1">
                          <span class="text-xs sm:text-sm text-gray-700 group-hover:text-gray-900">Turn on microphone</span>
                          <p class="text-[10px] sm:text-xs text-gray-500">Let others hear you</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 sm:py-3.5 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Join now
                </button>

                <button
                  type="button"
                  @click="goBack"
                  class="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg transition-colors border-2 border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Help text -->
        <div class="mt-4 sm:mt-8 text-center">
          <p class="text-xs sm:text-sm text-gray-600">
            💡 Tip: You can change your audio and video settings anytime during the call
          </p>
        </div>
      </div>
    </main>
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
