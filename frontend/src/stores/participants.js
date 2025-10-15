import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useParticipantsStore = defineStore('participants', () => {
  const participants = ref(new Map())
  const localParticipant = ref(null)

  const participantCount = computed(() => participants.value.size)

  const participantList = computed(() => {
    return Array.from(participants.value.values())
  })

  function addParticipant(participant) {
    participants.value.set(participant.id, participant)
  }

  function removeParticipant(participantId) {
    participants.value.delete(participantId)
  }

  function updateParticipant(participantId, updates) {
    const participant = participants.value.get(participantId)
    if (participant) {
      participants.value.set(participantId, { ...participant, ...updates })
    }
  }

  function setLocalParticipant(participant) {
    localParticipant.value = participant
  }

  function clearParticipants() {
    participants.value.clear()
    localParticipant.value = null
  }

  function getParticipant(participantId) {
    return participants.value.get(participantId)
  }

  return {
    participants,
    localParticipant,
    participantCount,
    participantList,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setLocalParticipant,
    clearParticipants,
    getParticipant
  }
})
