<template>
  <div class="fixed right-0 top-0 h-full w-full md:w-80 bg-[#202124] shadow-2xl z-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-[#3C4043]">
      <h3 class="text-lg font-semibold text-white">Participants ({{ participantCount }})</h3>
      <button
        @click="$emit('close')"
        class="p-2 rounded-full hover:bg-[#3C4043] transition-colors"
        title="Close participants"
      >
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Participants List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-2">
      <!-- Local User -->
      <div class="flex items-center justify-between p-3 bg-[#292A2D] rounded-lg hover:bg-[#3C4043] transition-colors group">
        <div class="flex items-center space-x-3 flex-1">
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {{ getInitials(localUserName) }}
          </div>
          <div class="flex-1 min-w-0">
            <input
              v-model="editableLocalName"
              @blur="updateLocalName"
              @keyup.enter="updateLocalName"
              class="bg-transparent text-white font-medium outline-none border-b border-transparent focus:border-blue-500 transition-colors w-full"
              :placeholder="localUserName"
            />
            <p class="text-xs text-gray-400">You (Host)</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Mic Status -->
          <div class="w-6 h-6 flex items-center justify-center" :title="isAudioEnabled ? 'Mic on' : 'Mic off'">
            <svg v-if="isAudioEnabled" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <!-- Video Status -->
          <div class="w-6 h-6 flex items-center justify-center" :title="isVideoEnabled ? 'Camera on' : 'Camera off'">
            <svg v-if="isVideoEnabled" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <svg v-else class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v.586l-4-4V4a2 2 0 00-2-2H6.414l-2.707-2.707zm3.586 3.586l7.414 7.414-1.121.561-2 1A1 1 0 0110 14V8.586l-2.707-2.707z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Remote Participants -->
      <div
        v-for="[participantId, participant] in remoteParticipants"
        :key="participantId"
        class="flex items-center justify-between p-3 bg-[#292A2D] rounded-lg hover:bg-[#3C4043] transition-colors"
      >
        <div class="flex items-center space-x-3 flex-1">
          <div class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
            {{ getInitials(participant.userName || 'Guest') }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">
              {{ participant.userName || `Participant ${participantId.slice(0, 8)}` }}
            </p>
            <p class="text-xs text-gray-400">Guest</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Connection Status -->
          <div class="w-2 h-2 rounded-full bg-green-500" title="Connected"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="participantCount === 1" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-gray-400">No other participants yet</p>
        <p class="text-sm text-gray-500 mt-1">Share the meeting link to invite others</p>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="p-4 border-t border-[#3C4043]">
      <div class="flex items-center justify-between text-sm text-gray-400">
        <span>Meeting ID: {{ meetingId }}</span>
        <button
          @click="copyMeetingId"
          class="px-3 py-1 bg-[#3C4043] hover:bg-[#5F6368] rounded text-white transition-colors"
          title="Copy meeting ID"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  participantCount: {
    type: Number,
    required: true,
  },
  remoteParticipants: {
    type: Map,
    default: () => new Map(),
  },
  localUserName: {
    type: String,
    default: 'Guest',
  },
  meetingId: {
    type: String,
    required: true,
  },
  isAudioEnabled: {
    type: Boolean,
    default: false,
  },
  isVideoEnabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update-name'])

const editableLocalName = ref(props.localUserName)

const getInitials = (name) => {
  if (!name) return 'G'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const updateLocalName = () => {
  if (editableLocalName.value && editableLocalName.value.trim() !== '') {
    emit('update-name', editableLocalName.value.trim())
  } else {
    editableLocalName.value = props.localUserName
  }
}

const copyMeetingId = () => {
  navigator.clipboard.writeText(props.meetingId)
}
</script>
