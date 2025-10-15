import { ref, computed } from 'vue'

// Media state
const localStream = ref(null)
const screenStream = ref(null)
const videoEnabled = ref(false)
const audioEnabled = ref(false)
const screenShareEnabled = ref(false)
const devices = ref({
  cameras: [],
  microphones: [],
  speakers: [],
})
const selectedDevices = ref({
  camera: null,
  microphone: null,
  speaker: null,
})
const permissionsGranted = ref({
  camera: false,
  microphone: false,
})

export function useMediaStream() {
  /**
   * Get available media devices
   */
  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      
      devices.value.cameras = deviceList.filter(d => d.kind === 'videoinput')
      devices.value.microphones = deviceList.filter(d => d.kind === 'audioinput')
      devices.value.speakers = deviceList.filter(d => d.kind === 'audiooutput')

      console.log('[Media] Found devices:', {
        cameras: devices.value.cameras.length,
        microphones: devices.value.microphones.length,
        speakers: devices.value.speakers.length,
      })

      // Set default devices if not selected
      if (!selectedDevices.value.camera && devices.value.cameras.length > 0) {
        selectedDevices.value.camera = devices.value.cameras[0].deviceId
      }
      if (!selectedDevices.value.microphone && devices.value.microphones.length > 0) {
        selectedDevices.value.microphone = devices.value.microphones[0].deviceId
      }

      return devices.value
    } catch (error) {
      console.error('[Media] Failed to get devices:', error)
      throw error
    }
  }

  /**
   * Request media permissions
   */
  const requestPermissions = async (video = true, audio = true) => {
    try {
      // First check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access')
      }

      // Try to get device list first
      await getDevices()

      // Build constraints based on available devices
      const constraints = {}
      
      if (video && devices.value.cameras.length > 0) {
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        }
      } else {
        constraints.video = false
      }
      
      if (audio && devices.value.microphones.length > 0) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      } else {
        constraints.audio = false
      }

      // If no devices available, return early
      if (!constraints.video && !constraints.audio) {
        console.warn('[Media] No camera or microphone devices found')
        permissionsGranted.value.camera = false
        permissionsGranted.value.microphone = false
        return permissionsGranted.value
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Check which permissions were granted
      permissionsGranted.value.camera = stream.getVideoTracks().length > 0
      permissionsGranted.value.microphone = stream.getAudioTracks().length > 0

      console.log('[Media] Permissions granted:', permissionsGranted.value)

      // Stop the temporary stream
      stream.getTracks().forEach(track => track.stop())

      // Get updated device list with labels
      await getDevices()

      return permissionsGranted.value
    } catch (error) {
      console.error('[Media] Permission denied:', error)
      
      // Set permissions to false
      permissionsGranted.value.camera = false
      permissionsGranted.value.microphone = false
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied. Please allow access and refresh.')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera/microphone found. Please connect a device and refresh.')
      }
      throw error
    }
  }

  /**
   * Start local media stream (camera + microphone)
   */
  const startLocalStream = async (enableVideo = true, enableAudio = true) => {
    try {
      // Stop existing stream if any
      if (localStream.value) {
        stopLocalStream()
      }

      const constraints = {
        video: enableVideo ? {
          deviceId: selectedDevices.value.camera ? { exact: selectedDevices.value.camera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        } : false,
        audio: enableAudio ? {
          deviceId: selectedDevices.value.microphone ? { exact: selectedDevices.value.microphone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      }

      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Update enabled states
      videoEnabled.value = localStream.value.getVideoTracks().length > 0
      audioEnabled.value = localStream.value.getAudioTracks().length > 0

      console.log('[Media] Local stream started:', {
        video: videoEnabled.value,
        audio: audioEnabled.value,
      })

      return localStream.value
    } catch (error) {
      console.error('[Media] Failed to start local stream:', error)
      throw error
    }
  }

  /**
   * Stop local media stream
   */
  const stopLocalStream = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        track.stop()
      })
      localStream.value = null
      videoEnabled.value = false
      audioEnabled.value = false
      console.log('[Media] Local stream stopped')
    }
  }

  /**
   * Toggle video on/off
   */
  const toggleVideo = async () => {
    if (!localStream.value) {
      // Start stream with video
      await startLocalStream(true, audioEnabled.value)
      return true
    }

    const videoTrack = localStream.value.getVideoTracks()[0]
    
    if (videoTrack) {
      // Disable existing video track
      videoTrack.enabled = !videoTrack.enabled
      videoEnabled.value = videoTrack.enabled
      
      if (!videoTrack.enabled) {
        // Stop and remove track
        videoTrack.stop()
        localStream.value.removeTrack(videoTrack)
      }
      
      console.log('[Media] Video toggled:', videoEnabled.value)
    } else {
      // Add video track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDevices.value.camera ? { exact: selectedDevices.value.camera } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        })
        
        const newVideoTrack = stream.getVideoTracks()[0]
        localStream.value.addTrack(newVideoTrack)
        videoEnabled.value = true
        
        console.log('[Media] Video enabled')
      } catch (error) {
        console.error('[Media] Failed to enable video:', error)
        throw error
      }
    }

    return videoEnabled.value
  }

  /**
   * Toggle audio on/off
   */
  const toggleAudio = async () => {
    if (!localStream.value) {
      // Start stream with audio
      await startLocalStream(videoEnabled.value, true)
      return true
    }

    const audioTrack = localStream.value.getAudioTracks()[0]
    
    if (audioTrack) {
      // Toggle existing audio track
      audioTrack.enabled = !audioTrack.enabled
      audioEnabled.value = audioTrack.enabled
      
      if (!audioTrack.enabled) {
        // Stop and remove track
        audioTrack.stop()
        localStream.value.removeTrack(audioTrack)
      }
      
      console.log('[Media] Audio toggled:', audioEnabled.value)
    } else {
      // Add audio track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedDevices.value.microphone ? { exact: selectedDevices.value.microphone } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        
        const newAudioTrack = stream.getAudioTracks()[0]
        localStream.value.addTrack(newAudioTrack)
        audioEnabled.value = true
        
        console.log('[Media] Audio enabled')
      } catch (error) {
        console.error('[Media] Failed to enable audio:', error)
        throw error
      }
    }

    return audioEnabled.value
  }

  /**
   * Start screen sharing
   */
  const startScreenShare = async () => {
    try {
      screenStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false,
      })

      // Handle screen share stop (user clicks browser's stop button)
      screenStream.value.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      screenShareEnabled.value = true
      console.log('[Media] Screen sharing started')
      
      return screenStream.value
    } catch (error) {
      console.error('[Media] Failed to start screen share:', error)
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied')
      }
      throw error
    }
  }

  /**
   * Stop screen sharing
   */
  const stopScreenShare = () => {
    if (screenStream.value) {
      screenStream.value.getTracks().forEach(track => {
        track.stop()
      })
      screenStream.value = null
      screenShareEnabled.value = false
      console.log('[Media] Screen sharing stopped')
    }
  }

  /**
   * Change camera device
   */
  const changeCamera = async (deviceId) => {
    selectedDevices.value.camera = deviceId
    
    if (localStream.value && videoEnabled.value) {
      // Restart video track with new camera
      const oldTrack = localStream.value.getVideoTracks()[0]
      if (oldTrack) {
        oldTrack.stop()
        localStream.value.removeTrack(oldTrack)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      const newTrack = stream.getVideoTracks()[0]
      localStream.value.addTrack(newTrack)
      
      console.log('[Media] Camera changed:', deviceId)
      return newTrack
    }
  }

  /**
   * Change microphone device
   */
  const changeMicrophone = async (deviceId) => {
    selectedDevices.value.microphone = deviceId
    
    if (localStream.value && audioEnabled.value) {
      // Restart audio track with new microphone
      const oldTrack = localStream.value.getAudioTracks()[0]
      if (oldTrack) {
        oldTrack.stop()
        localStream.value.removeTrack(oldTrack)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const newTrack = stream.getAudioTracks()[0]
      localStream.value.addTrack(newTrack)
      
      console.log('[Media] Microphone changed:', deviceId)
      return newTrack
    }
  }

  /**
   * Get video track from local stream
   */
  const getVideoTrack = () => {
    return localStream.value?.getVideoTracks()[0] || null
  }

  /**
   * Get audio track from local stream
   */
  const getAudioTrack = () => {
    return localStream.value?.getAudioTracks()[0] || null
  }

  /**
   * Get screen share track
   */
  const getScreenTrack = () => {
    return screenStream.value?.getVideoTracks()[0] || null
  }

  // Computed properties
  const hasVideo = computed(() => videoEnabled.value)
  const hasAudio = computed(() => audioEnabled.value)
  const hasScreenShare = computed(() => screenShareEnabled.value)
  const hasLocalStream = computed(() => localStream.value !== null)

  return {
    // State
    localStream,
    screenStream,
    videoEnabled,
    audioEnabled,
    screenShareEnabled,
    devices,
    selectedDevices,
    permissionsGranted,
    
    // Computed
    hasVideo,
    hasAudio,
    hasScreenShare,
    hasLocalStream,
    
    // Methods
    getDevices,
    requestPermissions,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    changeCamera,
    changeMicrophone,
    getVideoTrack,
    getAudioTrack,
    getScreenTrack,
  }
}
