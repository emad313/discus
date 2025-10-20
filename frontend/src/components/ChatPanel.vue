<template>
  <div class="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
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
        @mouseenter="hoveredMessageId = message.id"
        @mouseleave="hoveredMessageId = null"
      >
        <!-- Sender Name -->
        <span class="text-xs text-gray-500 mb-1 px-2">
          {{ message.senderName }}
          {{ message.senderId === currentUserId ? '(You)' : '' }}
        </span>
        
        <!-- Message Bubble -->
        <div class="relative group">
          <div
            :class="[
              'max-w-[80%] rounded-lg px-4 py-2 break-words',
              message.senderId === currentUserId
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
            ]"
          >
            <!-- File attachment preview -->
            <div v-if="message.file" class="mb-2">
              <!-- Image preview -->
              <img
                v-if="message.file.type?.startsWith('image/')"
                :src="message.file.url"
                :alt="message.file.name"
                class="max-w-full rounded cursor-pointer hover:opacity-90"
                @click="openFile(message.file)"
              />
              <!-- PDF/Document preview -->
              <a
                v-else
                :href="message.file.url"
                :download="message.file.name"
                class="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ message.file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(message.file.size) }}</p>
                </div>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>

            <p v-if="message.message" class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
            <span
              :class="[
                'text-xs block mt-1',
                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </span>
          </div>

          <!-- Reaction Button (shows on hover) -->
          <button
            v-if="hoveredMessageId === message.id"
            @click="toggleReactionPicker(message.id)"
            :class="[
              'absolute top-0 p-1 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all',
              message.senderId === currentUserId ? '-left-8' : '-right-8'
            ]"
            title="Add reaction"
          >
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <!-- Quick Reactions Picker -->
          <div
            v-if="reactionPickerMessageId === message.id"
            :class="[
              'absolute top-0 flex gap-1 bg-white border border-gray-300 rounded-full shadow-lg p-1.5 z-10',
              message.senderId === currentUserId ? '-left-48' : '-right-48'
            ]"
            @click.stop
          >
            <button
              v-for="reaction in quickReactions"
              :key="reaction"
              @click="addReaction(message.id, reaction)"
              class="text-xl hover:scale-125 transition-transform p-1"
            >
              {{ reaction }}
            </button>
          </div>

          <!-- Message Reactions Display -->
          <div v-if="message.reactions && message.reactions.length > 0" class="flex flex-wrap gap-1 mt-2">
            <button
              v-for="(reaction, index) in getReactionSummary(message.reactions)"
              :key="index"
              @click="toggleReaction(message.id, reaction.emoji)"
              :class="[
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                reaction.hasUserReacted
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
              ]"
            >
              <span>{{ reaction.emoji }}</span>
              <span class="font-medium">{{ reaction.count }}</span>
            </button>
          </div>
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
    <div class="p-4 border-t border-gray-200 bg-white relative">
      <!-- Emoji Picker -->
      <div v-if="showEmojiPicker" class="absolute bottom-20 right-4 z-20">
        <EmojiPicker @select="insertEmoji" />
      </div>

      <div class="flex items-end gap-2">
        <!-- File Upload Button -->
        <button
          @click="$refs.fileInput.click()"
          class="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          title="Attach file"
        >
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          @change="handleFileSelect"
        />

        <div class="flex-1">
          <textarea
            ref="messageTextarea"
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
          
          <!-- File Upload Preview -->
          <div v-if="selectedFile" class="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <div>
                <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button @click="selectedFile = null" class="text-red-500 hover:text-red-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="text-xs text-gray-400 mt-1 px-1">Press Enter to send, Shift+Enter for new line</p>
        </div>

        <!-- Emoji Button -->
        <button
          @click="showEmojiPicker = !showEmojiPicker"
          :class="[
            'p-3 rounded-lg transition-colors',
            showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          ]"
          title="Add emoji"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <!-- Send Button -->
        <button
          @click="handleSend"
          :disabled="(!messageInput.trim() && !selectedFile) || sending"
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
import EmojiPicker from './EmojiPicker.vue'

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

const emit = defineEmits(['send-message', 'send-file', 'add-reaction', 'remove-reaction', 'typing-start', 'typing-stop', 'close'])

const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const typingUsersList = computed(() => chatStore.typingUsersList)

const messageInput = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const messageTextarea = ref(null)
const fileInput = ref(null)
const isTyping = ref(false)
const showEmojiPicker = ref(false)
const selectedFile = ref(null)
const hoveredMessageId = ref(null)
const reactionPickerMessageId = ref(null)

// Quick reaction emojis
const quickReactions = ['👍', '❤️', '😂', '🎉', '🔥', '👏']

// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Close emoji picker when clicking outside
watch(showEmojiPicker, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      document.addEventListener('click', closeEmojiPicker)
    }, 100)
  } else {
    document.removeEventListener('click', closeEmojiPicker)
  }
})

const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

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

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Handle send message
const handleSend = async () => {
  if ((!messageInput.value.trim() && !selectedFile.value) || sending.value) return

  sending.value = true
  
  try {
    if (selectedFile.value) {
      // Send file with optional message
      await emit('send-file', selectedFile.value, messageInput.value)
      selectedFile.value = null
    } else {
      // Send text message
      await emit('send-message', messageInput.value)
    }
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

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    alert('File size must be less than 10MB')
    return
  }

  selectedFile.value = file
  event.target.value = '' // Reset input
}

// Open file in new tab
const openFile = (file) => {
  window.open(file.url, '_blank')
}

// Insert emoji at cursor position
const insertEmoji = (emoji) => {
  const textarea = messageTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = messageInput.value
  
  messageInput.value = text.substring(0, start) + emoji + text.substring(end)
  
  // Move cursor after emoji
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + emoji.length, start + emoji.length)
  })
  
  showEmojiPicker.value = false
}

// Toggle reaction picker for a message
const toggleReactionPicker = (messageId) => {
  reactionPickerMessageId.value = reactionPickerMessageId.value === messageId ? null : messageId
}

// Add reaction to message
const addReaction = (messageId, emoji) => {
  emit('add-reaction', { messageId, emoji, userId: props.currentUserId })
  reactionPickerMessageId.value = null
}

// Toggle reaction (add if not exists, remove if exists)
const toggleReaction = (messageId, emoji) => {
  const message = messages.value.find(m => m.id === messageId)
  if (!message || !message.reactions) return

  const userReaction = message.reactions.find(r => r.emoji === emoji && r.userId === props.currentUserId)
  
  if (userReaction) {
    emit('remove-reaction', { messageId, emoji, userId: props.currentUserId })
  } else {
    emit('add-reaction', { messageId, emoji, userId: props.currentUserId })
  }
}

// Get reaction summary (count per emoji)
const getReactionSummary = (reactions) => {
  if (!reactions) return []
  
  const summary = {}
  reactions.forEach(r => {
    if (!summary[r.emoji]) {
      summary[r.emoji] = {
        emoji: r.emoji,
        count: 0,
        userIds: []
      }
    }
    summary[r.emoji].count++
    summary[r.emoji].userIds.push(r.userId)
  })
  
  return Object.values(summary).map(r => ({
    ...r,
    hasUserReacted: r.userIds.includes(props.currentUserId)
  }))
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
