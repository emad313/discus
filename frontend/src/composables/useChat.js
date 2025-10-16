import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

export function useChat(socket, meetingId) {
  const chatStore = useChatStore()
  const typingTimeout = ref(null)

  // Send message
  const sendMessage = (message) => {
    return new Promise((resolve, reject) => {
      // Handle both ref and direct socket object
      const socketInstance = socket?.value || socket
      
      if (!socketInstance || !socketInstance.connected) {
        return reject(new Error('Socket not connected'))
      }

      if (!message || !message.trim()) {
        return reject(new Error('Message cannot be empty'))
      }

      socketInstance.emit(
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
    const socketInstance = socket?.value || socket
    if (!socketInstance || !socketInstance.connected) return

    socketInstance.emit('typing-start', { meetingId })

    // Auto-stop typing after 3 seconds
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

    typingTimeout.value = setTimeout(() => {
      handleTypingStop()
    }, 3000)
  }

  const handleTypingStop = () => {
    const socketInstance = socket?.value || socket
    if (!socketInstance || !socketInstance.connected) return

    socketInstance.emit('typing-stop', { meetingId })

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
    // Handle both ref and direct socket object
    const socketInstance = socket?.value || socket
    if (!socketInstance || typeof socketInstance.on !== 'function') {
      console.warn('[Chat] Socket not available or not initialized yet')
      return
    }

    socketInstance.on('receive-message', handleReceiveMessage)
    socketInstance.on('user-typing', handleUserTyping)
    socketInstance.on('user-stopped-typing', handleUserStoppedTyping)
    console.log('[Chat] Chat listeners setup successfully')
  }

  // Cleanup socket listeners
  const cleanupChatListeners = () => {
    // Handle both ref and direct socket object
    const socketInstance = socket?.value || socket
    if (!socketInstance || typeof socketInstance.off !== 'function') {
      // Socket already disconnected, no cleanup needed (this is normal during leave)
      return
    }

    socketInstance.off('receive-message', handleReceiveMessage)
    socketInstance.off('user-typing', handleUserTyping)
    socketInstance.off('user-stopped-typing', handleUserStoppedTyping)
    console.log('[Chat] Chat listeners cleaned up')

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
