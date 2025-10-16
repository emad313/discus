import { ref, onUnmounted } from 'vue'

/**
 * Active Speaker Detection Composable
 * Monitors audio levels from consumers to detect who is currently speaking
 * Returns the socket ID of the active speaker
 */
export function useActiveSpeaker() {
  const activeSpeakerId = ref(null)
  const audioLevels = ref(new Map())
  let animationFrameId = null
  let audioContexts = new Map()
  let analysers = new Map()

  // Threshold for detecting speech (0-1 scale)
  const SPEECH_THRESHOLD = 0.1
  
  // Debounce time to avoid flickering (ms)
  const DEBOUNCE_TIME = 500
  let lastSpeakerChangeTime = 0

  /**
   * Start monitoring audio level for a consumer
   * @param {string} socketId - Participant's socket ID
   * @param {MediaStreamTrack} audioTrack - Audio track to monitor
   */
  const startMonitoring = (socketId, audioTrack) => {
    try {
      // Create audio context and analyser for this track
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8

      // Create media stream source from track
      const stream = new MediaStream([audioTrack])
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Store for cleanup
      audioContexts.set(socketId, audioContext)
      analysers.set(socketId, analyser)

      console.log(`[ActiveSpeaker] Started monitoring audio for ${socketId}`)
    } catch (error) {
      console.error(`[ActiveSpeaker] Error starting monitoring for ${socketId}:`, error)
    }
  }

  /**
   * Stop monitoring audio for a participant
   * @param {string} socketId - Participant's socket ID
   */
  const stopMonitoring = (socketId) => {
    const audioContext = audioContexts.get(socketId)
    if (audioContext) {
      audioContext.close()
      audioContexts.delete(socketId)
    }
    analysers.delete(socketId)
    audioLevels.value.delete(socketId)
    
    // Clear active speaker if they left
    if (activeSpeakerId.value === socketId) {
      activeSpeakerId.value = null
    }

    console.log(`[ActiveSpeaker] Stopped monitoring audio for ${socketId}`)
  }

  /**
   * Get current audio level for a participant (0-1 scale)
   * @param {string} socketId - Participant's socket ID
   * @returns {number} Audio level
   */
  const getAudioLevel = (socketId) => {
    const analyser = analysers.get(socketId)
    if (!analyser) return 0

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    // Calculate RMS (Root Mean Square) for audio level
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    
    // Normalize to 0-1 scale
    return rms / 255
  }

  /**
   * Update audio levels and determine active speaker
   */
  const updateAudioLevels = () => {
    const now = Date.now()
    let maxLevel = 0
    let loudestSpeaker = null

    // Update levels for all monitored participants
    analysers.forEach((_, socketId) => {
      const level = getAudioLevel(socketId)
      audioLevels.value.set(socketId, level)

      if (level > maxLevel) {
        maxLevel = level
        loudestSpeaker = socketId
      }
    })

    // Update active speaker if someone is speaking above threshold
    // and enough time has passed since last change (debounce)
    if (maxLevel > SPEECH_THRESHOLD && now - lastSpeakerChangeTime > DEBOUNCE_TIME) {
      if (activeSpeakerId.value !== loudestSpeaker) {
        activeSpeakerId.value = loudestSpeaker
        lastSpeakerChangeTime = now
        console.log(`[ActiveSpeaker] Active speaker changed to ${loudestSpeaker} (level: ${maxLevel.toFixed(2)})`)
      }
    } else if (maxLevel <= SPEECH_THRESHOLD) {
      // Clear active speaker if no one is speaking
      if (activeSpeakerId.value !== null) {
        activeSpeakerId.value = null
      }
    }

    // Continue monitoring
    animationFrameId = requestAnimationFrame(updateAudioLevels)
  }

  /**
   * Start the active speaker detection loop
   */
  const startDetection = () => {
    if (!animationFrameId) {
      console.log('[ActiveSpeaker] Starting active speaker detection')
      updateAudioLevels()
    }
  }

  /**
   * Stop the active speaker detection loop
   */
  const stopDetection = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
      console.log('[ActiveSpeaker] Stopped active speaker detection')
    }
  }

  /**
   * Cleanup all resources
   */
  const cleanup = () => {
    stopDetection()
    
    // Close all audio contexts
    audioContexts.forEach((context) => {
      context.close()
    })
    
    audioContexts.clear()
    analysers.clear()
    audioLevels.value.clear()
    activeSpeakerId.value = null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    activeSpeakerId,
    audioLevels,
    startMonitoring,
    stopMonitoring,
    startDetection,
    stopDetection,
    cleanup
  }
}
