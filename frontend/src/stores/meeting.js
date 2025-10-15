import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMeetingStore = defineStore('meeting', () => {
  const meetingId = ref(null)
  const meetingName = ref('')
  const isActive = ref(false)
  const isHost = ref(false)
  const startTime = ref(null)

  const duration = computed(() => {
    if (!startTime.value) return '00:00:00'
    const now = Date.now()
    const diff = now - startTime.value
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  function createMeeting(id) {
    meetingId.value = id
    isHost.value = true
    isActive.value = true
    startTime.value = Date.now()
  }

  function joinMeeting(id) {
    meetingId.value = id
    isHost.value = false
    isActive.value = true
    startTime.value = Date.now()
  }

  function leaveMeeting() {
    meetingId.value = null
    isActive.value = false
    isHost.value = false
    startTime.value = null
  }

  return {
    meetingId,
    meetingName,
    isActive,
    isHost,
    startTime,
    duration,
    createMeeting,
    joinMeeting,
    leaveMeeting
  }
})
