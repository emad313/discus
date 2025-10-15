<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <header class="px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <span class="text-white text-xl font-bold">D</span>
        </div>
        <span class="text-2xl font-medium text-gray-800">{{ appName }}</span>
      </div>
      <div class="flex items-center gap-4">
        <button class="text-gray-600 hover:text-gray-800 text-sm font-medium">
          About
        </button>
        <button class="text-gray-600 hover:text-gray-800 text-sm font-medium">
          Help
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="max-w-6xl w-full">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Side - Actions -->
          <div class="space-y-8">
            <div>
              <h1 class="text-5xl font-normal text-gray-800 mb-4 leading-tight">
                Video calls and meetings for everyone
              </h1>
              <p class="text-lg text-gray-600">
                Connect, collaborate and celebrate from anywhere with {{ appName }}
              </p>
            </div>

            <div class="space-y-4">
              <!-- New Meeting Button -->
              <button
                @click="createNewMeeting"
                class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>New meeting</span>
              </button>

              <!-- Join Meeting Input -->
              <div class="flex items-center gap-3">
                <div class="flex-1 relative">
                  <input
                    v-model="meetingCode"
                    type="text"
                    placeholder="Enter a code or link"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    @keyup.enter="joinMeeting"
                  />
                </div>
                <button
                  @click="joinMeeting"
                  :disabled="!meetingCode"
                  class="text-blue-600 hover:text-blue-700 font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-blue-600"
                >
                  Join
                </button>
              </div>
            </div>

            <!-- Features List -->
            <div class="pt-6 space-y-3">
              <div class="flex items-center gap-3 text-gray-600">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Support for 100+ participants</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">No account required</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">100% free and open-source</span>
              </div>
            </div>
          </div>

          <!-- Right Side - Illustration -->
          <div class="hidden lg:block">
            <div class="relative">
              <!-- Main Image Container -->
              <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 aspect-video flex items-center justify-center shadow-2xl">
                <div class="text-center">
                  <!-- Animated Video Icon -->
                  <div class="relative inline-block mb-6">
                    <div class="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <!-- Connecting Dots -->
                    <div class="absolute -right-8 top-1/2 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    <div class="absolute -left-8 top-1/2 w-3 h-3 bg-blue-500 rounded-full animate-ping" style="animation-delay: 0.5s"></div>
                  </div>
                  <h3 class="text-2xl font-semibold text-gray-800 mb-2">Ready to connect?</h3>
                  <p class="text-gray-600">Start a meeting in one click</p>
                </div>
              </div>
              
              <!-- Floating Cards -->
              <div class="absolute -top-4 -left-4 bg-white rounded-xl shadow-xl p-4 animate-float">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-bold">A</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">Alice</div>
                    <div class="text-xs text-gray-500">Online</div>
                  </div>
                </div>
              </div>
              
              <div class="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 animate-float" style="animation-delay: 1s">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-bold">B</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">Bob</div>
                    <div class="text-xs text-gray-500">Online</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="grid md:grid-cols-3 gap-6 mt-16">
          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Secure by default</h3>
            <p class="text-sm text-gray-600">Built-in security features keep your meetings safe</p>
          </div>
          
          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Crystal clear quality</h3>
            <p class="text-sm text-gray-600">HD video and audio for professional meetings</p>
          </div>
          
          <div class="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Lightning fast</h3>
            <p class="text-sm text-gray-600">Optimized performance for smooth experiences</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="px-6 py-6 border-t border-gray-200">
      <div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center gap-6">
          <span>© 2025 Discus</span>
          <a href="#" class="hover:text-gray-800">Privacy</a>
          <a href="#" class="hover:text-gray-800">Terms</a>
        </div>
        <div class="flex items-center gap-4">
          <a href="https://github.com/emad313/discus" target="_blank" class="hover:text-gray-800">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>

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
