import { ref, computed } from 'vue'
import { Device } from 'mediasoup-client'
import { io } from 'socket.io-client'

// WebRTC connection state
const device = ref(null)
const socket = ref(null)
const sendTransport = ref(null)
const recvTransport = ref(null)
const producers = ref(new Map()) // Map of producerId -> producer
const consumers = ref(new Map()) // Map of consumerId -> consumer
const remoteStreams = ref(new Map()) // Map of participantId -> MediaStream
const isConnected = ref(false)
const isProducing = ref(false)

export function useWebRTC() {
  /**
   * Initialize WebRTC connection and Device
   */
  const initialize = async (socketUrl = null) => {
    try {
      // Connect to Socket.io server
      const url = socketUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
      socket.value = io(url, {
        transports: ['websocket', 'polling'],
      })

      // Setup socket event listeners
      setupSocketListeners()

      // Create Mediasoup Device
      device.value = new Device()

      console.log('[WebRTC] Initialized successfully')
      return true
    } catch (error) {
      console.error('[WebRTC] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Join a meeting room and load device capabilities
   */
  const joinRoom = async (meetingId, userName) => {
    if (!socket.value) {
      throw new Error('Socket not initialized')
    }

    return new Promise((resolve, reject) => {
      // Join meeting room via socket
      socket.value.emit('join-meeting', { meetingId, userName }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Join room failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          // Load device with RTP capabilities from server
          if (!device.value.loaded) {
            await device.value.load({ routerRtpCapabilities: response.rtpCapabilities })
            console.log('[WebRTC] Device loaded with RTP capabilities')
          }

          isConnected.value = true
          console.log('[WebRTC] Joined room:', meetingId)
          resolve(response)
        } catch (error) {
          console.error('[WebRTC] Failed to load device:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * Create send transport for producing media
   */
  const createSendTransport = async () => {
    if (!socket.value || !device.value) {
      throw new Error('Socket or Device not initialized')
    }

    return new Promise((resolve, reject) => {
      socket.value.emit('create-transport', { direction: 'send' }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Create send transport failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          // Create WebRTC send transport
          sendTransport.value = device.value.createSendTransport({
            id: response.id,
            iceParameters: response.iceParameters,
            iceCandidates: response.iceCandidates,
            dtlsParameters: response.dtlsParameters,
          })

          // Handle 'connect' event
          sendTransport.value.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              await new Promise((resolve, reject) => {
                socket.value.emit('connect-transport', {
                  transportId: sendTransport.value.id,
                  dtlsParameters,
                }, (response) => {
                  if (response.error) {
                    reject(new Error(response.error))
                  } else {
                    resolve()
                  }
                })
              })
              callback()
            } catch (error) {
              errback(error)
            }
          })

          // Handle 'produce' event
          sendTransport.value.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
              const { producerId } = await new Promise((resolve, reject) => {
                socket.value.emit('produce', {
                  transportId: sendTransport.value.id,
                  kind,
                  rtpParameters,
                  appData,
                }, (response) => {
                  if (response.error) {
                    reject(new Error(response.error))
                  } else {
                    resolve(response)
                  }
                })
              })
              callback({ id: producerId })
            } catch (error) {
              errback(error)
            }
          })

          // Handle connection state changes
          sendTransport.value.on('connectionstatechange', (state) => {
            console.log('[WebRTC] Send transport state:', state)
            if (state === 'failed' || state === 'closed') {
              console.error('[WebRTC] Send transport connection failed')
            }
          })

          console.log('[WebRTC] Send transport created:', sendTransport.value.id)
          resolve(sendTransport.value)
        } catch (error) {
          console.error('[WebRTC] Failed to create send transport:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * Create receive transport for consuming media
   */
  const createRecvTransport = async () => {
    if (!socket.value || !device.value) {
      throw new Error('Socket or Device not initialized')
    }

    return new Promise((resolve, reject) => {
      socket.value.emit('create-transport', { direction: 'recv' }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Create recv transport failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          // Create WebRTC receive transport
          recvTransport.value = device.value.createRecvTransport({
            id: response.id,
            iceParameters: response.iceParameters,
            iceCandidates: response.iceCandidates,
            dtlsParameters: response.dtlsParameters,
          })

          // Handle 'connect' event
          recvTransport.value.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              await new Promise((resolve, reject) => {
                socket.value.emit('connect-transport', {
                  transportId: recvTransport.value.id,
                  dtlsParameters,
                }, (response) => {
                  if (response.error) {
                    reject(new Error(response.error))
                  } else {
                    resolve()
                  }
                })
              })
              callback()
            } catch (error) {
              errback(error)
            }
          })

          // Handle connection state changes
          recvTransport.value.on('connectionstatechange', (state) => {
            console.log('[WebRTC] Recv transport state:', state)
            if (state === 'failed' || state === 'closed') {
              console.error('[WebRTC] Recv transport connection failed')
            }
          })

          console.log('[WebRTC] Recv transport created:', recvTransport.value.id)
          resolve(recvTransport.value)
        } catch (error) {
          console.error('[WebRTC] Failed to create recv transport:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * Produce media (send video/audio to server)
   */
  const produce = async (track, kind) => {
    if (!sendTransport.value) {
      await createSendTransport()
    }

    try {
      const producer = await sendTransport.value.produce({
        track,
        encodings: kind === 'video' ? [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ] : undefined,
        codecOptions: kind === 'video' ? {
          videoGoogleStartBitrate: 1000,
        } : undefined,
        appData: { kind },
      })

      producers.value.set(producer.id, producer)
      isProducing.value = true

      producer.on('trackended', () => {
        console.log('[WebRTC] Producer track ended:', producer.id)
        closeProducer(producer.id)
      })

      producer.on('transportclose', () => {
        console.log('[WebRTC] Producer transport closed:', producer.id)
        producers.value.delete(producer.id)
      })

      console.log('[WebRTC] Producing', kind, 'track:', producer.id)
      return producer
    } catch (error) {
      console.error('[WebRTC] Failed to produce:', error)
      throw error
    }
  }

  /**
   * Consume media from another participant
   */
  const consume = async (producerId, participantId) => {
    if (!recvTransport.value) {
      await createRecvTransport()
    }

    return new Promise((resolve, reject) => {
      socket.value.emit('consume', {
        transportId: recvTransport.value.id,
        producerId,
        rtpCapabilities: device.value.rtpCapabilities,
      }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Consume failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          const consumer = await recvTransport.value.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters,
          })

          consumers.value.set(consumer.id, consumer)

          // Add track to remote stream
          let stream = remoteStreams.value.get(participantId)
          if (!stream) {
            stream = new MediaStream()
            remoteStreams.value.set(participantId, stream)
          }
          stream.addTrack(consumer.track)

          consumer.on('trackended', () => {
            console.log('[WebRTC] Consumer track ended:', consumer.id)
          })

          consumer.on('transportclose', () => {
            console.log('[WebRTC] Consumer transport closed:', consumer.id)
            consumers.value.delete(consumer.id)
          })

          // Resume consumer (required by mediasoup)
          socket.value.emit('resume-consumer', { consumerId: consumer.id })

          console.log('[WebRTC] Consuming', response.kind, 'from:', participantId)
          resolve({ consumer, stream })
        } catch (error) {
          console.error('[WebRTC] Failed to consume:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * Close a producer
   */
  const closeProducer = (producerId) => {
    const producer = producers.value.get(producerId)
    if (producer) {
      producer.close()
      producers.value.delete(producerId)
      
      // Notify server
      if (socket.value) {
        socket.value.emit('close-producer', { producerId })
      }
      
      console.log('[WebRTC] Closed producer:', producerId)
    }

    if (producers.value.size === 0) {
      isProducing.value = false
    }
  }

  /**
   * Pause/Resume producer (mute/unmute)
   */
  const pauseProducer = (producerId) => {
    const producer = producers.value.get(producerId)
    if (producer && !producer.paused) {
      producer.pause()
      socket.value?.emit('pause-producer', { producerId })
      console.log('[WebRTC] Paused producer:', producerId)
    }
  }

  const resumeProducer = (producerId) => {
    const producer = producers.value.get(producerId)
    if (producer && producer.paused) {
      producer.resume()
      socket.value?.emit('resume-producer', { producerId })
      console.log('[WebRTC] Resumed producer:', producerId)
    }
  }

  /**
   * Setup socket event listeners
   */
  const setupSocketListeners = () => {
    if (!socket.value) return

    // New producer available (another participant)
    socket.value.on('new-producer', async ({ producerId, participantId }) => {
      console.log('[WebRTC] New producer available:', producerId, 'from:', participantId)
      try {
        await consume(producerId, participantId)
      } catch (error) {
        console.error('[WebRTC] Failed to consume new producer:', error)
      }
    })

    // Producer closed
    socket.value.on('producer-closed', ({ producerId, participantId }) => {
      console.log('[WebRTC] Producer closed:', producerId, 'from:', participantId)
      // Remove track from remote stream
      const stream = remoteStreams.value.get(participantId)
      if (stream) {
        // Clean up tracks
        stream.getTracks().forEach(track => {
          track.stop()
          stream.removeTrack(track)
        })
      }
    })

    // Participant left
    socket.value.on('participant-left', ({ participantId }) => {
      console.log('[WebRTC] Participant left:', participantId)
      // Clean up remote stream
      const stream = remoteStreams.value.get(participantId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        remoteStreams.value.delete(participantId)
      }
    })

    // Connection events
    socket.value.on('connect', () => {
      console.log('[WebRTC] Socket connected')
    })

    socket.value.on('disconnect', () => {
      console.log('[WebRTC] Socket disconnected')
      isConnected.value = false
    })

    socket.value.on('error', (error) => {
      console.error('[WebRTC] Socket error:', error)
    })
  }

  /**
   * Leave room and cleanup
   */
  const leaveRoom = () => {
    // Close all producers
    producers.value.forEach((producer) => {
      producer.close()
    })
    producers.value.clear()

    // Close all consumers
    consumers.value.forEach((consumer) => {
      consumer.close()
    })
    consumers.value.clear()

    // Close transports
    if (sendTransport.value) {
      sendTransport.value.close()
      sendTransport.value = null
    }
    if (recvTransport.value) {
      recvTransport.value.close()
      recvTransport.value = null
    }

    // Clean up remote streams
    remoteStreams.value.forEach((stream) => {
      stream.getTracks().forEach(track => track.stop())
    })
    remoteStreams.value.clear()

    // Disconnect socket
    if (socket.value) {
      socket.value.emit('leave-meeting')
      socket.value.disconnect()
      socket.value = null
    }

    isConnected.value = false
    isProducing.value = false
    device.value = null

    console.log('[WebRTC] Left room and cleaned up')
  }

  // Computed properties
  const producerIds = computed(() => Array.from(producers.value.keys()))
  const consumerIds = computed(() => Array.from(consumers.value.keys()))
  const remoteParticipants = computed(() => Array.from(remoteStreams.value.keys()))

  return {
    // State
    device,
    socket,
    isConnected,
    isProducing,
    producers,
    consumers,
    remoteStreams,
    producerIds,
    consumerIds,
    remoteParticipants,
    
    // Methods
    initialize,
    joinRoom,
    leaveRoom,
    createSendTransport,
    createRecvTransport,
    produce,
    consume,
    closeProducer,
    pauseProducer,
    resumeProducer,
  }
}
