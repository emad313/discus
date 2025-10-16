import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let toastIdCounter = 0

  /**
   * Add a new toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in ms (0 = no auto-dismiss)
   */
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastIdCounter
    
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto-dismiss if duration > 0
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  /**
   * Remove a toast by ID
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  const clearAll = () => {
    toasts.value = []
  }

  // Convenience methods for different types
  const success = (message, duration = 5000) => addToast(message, 'success', duration)
  const error = (message, duration = 5000) => addToast(message, 'error', duration)
  const warning = (message, duration = 5000) => addToast(message, 'warning', duration)
  const info = (message, duration = 5000) => addToast(message, 'info', duration)

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
})
