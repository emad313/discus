import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const unreadCount = ref(0)
  const typingUsers = ref(new Set())
  const chatOpen = ref(false)

  const addMessage = (message) => {
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
    setTyping,
    removeTyping,
    openChat,
    closeChat,
    toggleChat,
  }
})
