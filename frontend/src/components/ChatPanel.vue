<template>
  <div class="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-gray-800">Chat</h3>
        <span v-if="participantCount" class="text-sm text-gray-500">{{ participantCount }} participants</span>
      </div>
      <button
        @click="$emit('close')"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Close chat"
      >
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex flex-col',
          message.senderId === currentUserId ? 'items-end' : 'items-start'
        ]"
      >
        <!-- Sender Name -->
        <span class="text-xs text-gray-500 mb-1 px-2">
          {{ message.senderName }}
          {{ message.senderId === currentUserId ? '(You)' : '' }}
        </span>
        
        <!-- Message Bubble -->
        <div
          :class="[
            'max-w-[80%] rounded-lg px-4 py-2 break-words',
            message.senderId === currentUserId
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
          ]"
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
          <span
            :class="[
              'text-xs block mt-1',
              message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="typingUsersList.length > 0" class="flex items-center gap-2 text-sm text-gray-500 px-2">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
        <span>
          {{ typingUsersList.map(u => u.userName).join(', ') }}
          {{ typingUsersList.length === 1 ? 'is' : 'are' }} typing...
        </span>
      </div>

      <!-- Empty State -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-gray-600 font-medium">No messages yet</p>
        <p class="text-gray-400 text-sm mt-1">Start the conversation!</p>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200 bg-white">
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <textarea
            v-model="messageInput"
            @keydown.enter.exact.prevent="handleSend"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            placeholder="Type a message..."
            rows="1"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none transition-colors"
            style="max-height: 120px"
          ></textarea>
          <p class="text-xs text-gray-400 mt-1 px-1">Press Enter to send, Shift+Enter for new line</p>
        </div>
        
        <!-- Send Button -->
        <button
          @click="handleSend"
          :disabled="!messageInput.trim() || sending"
          class="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Send message"
        >
          <svg v-if="!sending" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <svg v-else class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '../stores/chat'

const props = defineProps({
  currentUserId: {
    type: String,
    required: true,
  },
  participantCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['send-message', 'typing-start', 'typing-stop', 'close'])

const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const typingUsersList = computed(() => chatStore.typingUsersList)

const messageInput = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const isTyping = ref(false)

// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
}

// Handle send message
const handleSend = async () => {
  if (!messageInput.value.trim() || sending.value) return

  sending.value = true
  
  try {
    await emit('send-message', messageInput.value)
    messageInput.value = ''
    
    // Stop typing indicator
    if (isTyping.value) {
      emit('typing-stop')
      isTyping.value = false
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

// Handle typing
let typingTimer = null
const handleInput = () => {
  if (!isTyping.value) {
    emit('typing-start')
    isTyping.value = true
  }

  // Reset typing timeout
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    if (isTyping.value) {
      emit('typing-stop')
      isTyping.value = false
    }
  }, 2000)
}

const handleFocus = () => {
  chatStore.unreadCount = 0
}

const handleBlur = () => {
  if (isTyping.value) {
    emit('typing-stop')
    isTyping.value = false
  }
}
</script>
