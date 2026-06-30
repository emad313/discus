import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const unreadCount = ref(0)
  const typingUsers = ref(new Set())
  const chatOpen = ref(false)

  const addMessage = (message) => {
    // Initialize reactions array if not present
    if (!message.reactions) {
      message.reactions = []
    }
    messages.value.push(message)
    
    // Increment unread count if chat is closed
    if (!chatOpen.value) {
      unreadCount.value++
    }
  }

  const clearMessages = () => {
    messages.value = []
    unreadCount.value = 0
  }

  const addReaction = (messageId, emoji, userId, userName) => {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      if (!message.reactions) {
        message.reactions = []
      }
      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find(
        r => r.emoji === emoji && r.userId === userId
      )
      if (!existingReaction) {
        message.reactions.push({ emoji, userId, userName, timestamp: Date.now() })
      }
    }
  }

  const removeReaction = (messageId, emoji, userId) => {
    const message = messages.value.find(m => m.id === messageId)
    if (message && message.reactions) {
      message.reactions = message.reactions.filter(
        r => !(r.emoji === emoji && r.userId === userId)
      )
    }
  }

  const setTyping = (userId, userName) => {
    typingUsers.value.add(JSON.stringify({ userId, userName }))
  }

  const removeTyping = (userId) => {
    typingUsers.value = new Set(
      Array.from(typingUsers.value).filter(
        (user) => JSON.parse(user).userId !== userId
      )
    )
  }

  const openChat = () => {
    chatOpen.value = true
    unreadCount.value = 0
  }

  const closeChat = () => {
    chatOpen.value = false
  }

  const toggleChat = () => {
    if (chatOpen.value) {
      closeChat()
    } else {
      openChat()
    }
  }

  const typingUsersList = computed(() => {
    return Array.from(typingUsers.value).map((user) => JSON.parse(user))
  })

  return {
    messages,
    unreadCount,
    typingUsers,
    typingUsersList,
    chatOpen,
    addMessage,
    clearMessages,
    addReaction,
    removeReaction,
    setTyping,
    removeTyping,
    openChat,
    closeChat,
    toggleChat,
  }
})
