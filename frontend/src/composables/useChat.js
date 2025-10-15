import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

export function useChat(socket, meetingId) {
  const chatStore = useChatStore()
  const typingTimeout = ref(null)

  // Send message
  const sendMessage = (message) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        return reject(new Error('Socket not connected'))
      }

      if (!message || !message.trim()) {
        return reject(new Error('Message cannot be empty'))
      }

      socket.emit(
        'send-message',
        {
          meetingId,
          message: message.trim(),
          timestamp: Date.now(),
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    })
  }

  // Handle receiving messages
  const handleReceiveMessage = (message) => {
    chatStore.addMessage(message)
  }

  // Handle typing indicator
  const handleTypingStart = () => {
    if (!socket || !socket.connected) return

    socket.emit('typing-start', { meetingId })

    // Auto-stop typing after 3 seconds
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

    typingTimeout.value = setTimeout(() => {
      handleTypingStop()
    }, 3000)
  }

  const handleTypingStop = () => {
    if (!socket || !socket.connected) return

    socket.emit('typing-stop', { meetingId })

    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
      typingTimeout.value = null
    }
  }

  // Handle other users typing
  const handleUserTyping = ({ userId, userName }) => {
    chatStore.setTyping(userId, userName)

    // Auto-clear typing indicator after 5 seconds
    setTimeout(() => {
      chatStore.removeTyping(userId)
    }, 5000)
  }

  const handleUserStoppedTyping = ({ userId }) => {
    chatStore.removeTyping(userId)
  }

  // Setup socket listeners
  const setupChatListeners = () => {
    if (!socket) return

    socket.on('receive-message', handleReceiveMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stopped-typing', handleUserStoppedTyping)
  }

  // Cleanup socket listeners
  const cleanupChatListeners = () => {
    if (!socket) return

    socket.off('receive-message', handleReceiveMessage)
    socket.off('user-typing', handleUserTyping)
    socket.off('user-stopped-typing', handleUserStoppedTyping)

    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }
  }

  return {
    sendMessage,
    handleTypingStart,
    handleTypingStop,
    setupChatListeners,
    cleanupChatListeners,
  }
}
