<template>
  <!-- Mobile Bottom Navigation Bar -->
  <div
    class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 md:hidden z-40"
    :class="isFullscreen ? 'hidden' : 'block'"
  >
    <div class="flex justify-around items-center py-3 px-2">
      <!-- Microphone Toggle -->
      <button
        @click="$emit('toggle-audio')"
        :class="[
          'flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors min-w-[64px]',
          audioEnabled
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-red-600 text-white hover:bg-red-700'
        ]"
      >
        <svg v-if="audioEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <span class="text-xs">{{ audioEnabled ? 'Mute' : 'Unmuted' }}</span>
      </button>

      <!-- Camera Toggle -->
      <button
        @click="$emit('toggle-video')"
        :class="[
          'flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors min-w-[64px]',
          videoEnabled
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-red-600 text-white hover:bg-red-700'
        ]"
      >
        <svg v-if="videoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <span class="text-xs">{{ videoEnabled ? 'Stop' : 'Start' }}</span>
      </button>

      <!-- Chat Toggle -->
      <button
        @click="$emit('toggle-chat')"
        :class="[
          'flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors min-w-[64px] relative',
          chatOpen
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        ]"
      >
        <div class="relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span
            v-if="unreadCount > 0 && !chatOpen"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </div>
        <span class="text-xs">Chat</span>
      </button>

      <!-- Participants Toggle -->
      <button
        @click="$emit('toggle-participants')"
        :class="[
          'flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors min-w-[64px]',
          participantsOpen
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        ]"
      >
        <div class="relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
            {{ participantCount }}
          </span>
        </div>
        <span class="text-xs">People</span>
      </button>

      <!-- Leave Call -->
      <button
        @click="$emit('leave-call')"
        class="flex flex-col items-center space-y-1 p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors min-w-[64px]"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-xs">Leave</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  audioEnabled: {
    type: Boolean,
    default: false
  },
  videoEnabled: {
    type: Boolean,
    default: false
  },
  chatOpen: {
    type: Boolean,
    default: false
  },
  participantsOpen: {
    type: Boolean,
    default: false
  },
  participantCount: {
    type: Number,
    default: 0
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-audio', 'toggle-video', 'toggle-chat', 'toggle-participants', 'leave-call'])
</script>
