import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMediaStore = defineStore('media', () => {
  const isVideoEnabled = ref(true)
  const isAudioEnabled = ref(true)
  const isScreenSharing = ref(false)
  const selectedCamera = ref(null)
  const selectedMicrophone = ref(null)
  const selectedSpeaker = ref(null)
  const availableCameras = ref([])
  const availableMicrophones = ref([])
  const availableSpeakers = ref([])

  function toggleVideo() {
    isVideoEnabled.value = !isVideoEnabled.value
    return isVideoEnabled.value
  }

  function toggleAudio() {
    isAudioEnabled.value = !isAudioEnabled.value
    return isAudioEnabled.value
  }

  function toggleScreenShare() {
    isScreenSharing.value = !isScreenSharing.value
    return isScreenSharing.value
  }

  function setDevices(cameras, microphones, speakers) {
    availableCameras.value = cameras
    availableMicrophones.value = microphones
    availableSpeakers.value = speakers
    
    if (cameras.length > 0 && !selectedCamera.value) {
      selectedCamera.value = cameras[0].deviceId
    }
    if (microphones.length > 0 && !selectedMicrophone.value) {
      selectedMicrophone.value = microphones[0].deviceId
    }
    if (speakers.length > 0 && !selectedSpeaker.value) {
      selectedSpeaker.value = speakers[0].deviceId
    }
  }

  function selectCamera(deviceId) {
    selectedCamera.value = deviceId
  }

  function selectMicrophone(deviceId) {
    selectedMicrophone.value = deviceId
  }

  function selectSpeaker(deviceId) {
    selectedSpeaker.value = deviceId
  }

  return {
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    availableCameras,
    availableMicrophones,
    availableSpeakers,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    setDevices,
    selectCamera,
    selectMicrophone,
    selectSpeaker
  }
})
