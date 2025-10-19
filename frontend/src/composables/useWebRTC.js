import { ref, computed } from 'vue'
import { Device } from 'mediasoup-client'
import { io } from 'socket.io-client'

// WebRTC connection state
const device = ref(null)
const socket = ref(null)
const sendTransport = ref(null)
const recvTransport = ref(null)
const producers = ref(new Map()) // Map of producerId -> { producer, kind, type }
const consumers = ref(new Map()) // Map of consumerId -> consumer
const remoteStreams = ref(new Map()) // Map of participantId -> MediaStream (camera/mic)
const screenStreams = ref(new Map()) // Map of participantId -> MediaStream (screen share)
const participants = ref(new Map()) // Map of participantId -> participant info
const isConnected = ref(false)
const isProducing = ref(false)
const currentRoomId = ref(null) // Store current meeting/room ID

export function useWebRTC() {
  /**
   * Initialize WebRTC connection and Device
   */
  const initialize = async (socketUrl = null) => {
    try {
      // Connect to Socket.io server
      // If no URL provided, Socket.IO will use current origin (window.location.origin)
      const url = socketUrl || import.meta.env.VITE_SOCKET_URL || window.location.origin
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

          // Store current room ID
          currentRoomId.value = meetingId

          // Add existing peers to participants
          if (response.peers && response.peers.length > 0) {
            console.log('[WebRTC] Found', response.peers.length, 'existing peer(s)')
            for (const peer of response.peers) {
              participants.value.set(peer.peerId, { 
                id: peer.peerId, 
                userName: peer.userName 
              })
              
              // Consume existing producers from this peer
              if (peer.producers && peer.producers.length > 0) {
                console.log('[WebRTC] Peer', peer.userName, 'has', peer.producers.length, 'producer(s)')
                for (const producer of peer.producers) {
                  console.log('[WebRTC] Will consume', producer.producerType || producer.kind, 'from peer', peer.peerId)
                  // We'll consume these after creating recv transport
                  // Store them for later consumption
                  if (!window._pendingConsumers) window._pendingConsumers = []
                  window._pendingConsumers.push({
                    producerId: producer.id,
                    peerId: peer.peerId,
                    kind: producer.kind,
                    producerType: producer.producerType || producer.kind
                  })
                }
              }
            }
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
      socket.value.emit('create-transport', { 
        meetingId: currentRoomId.value,
        direction: 'send' 
      }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Create send transport failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          // Create WebRTC send transport with ICE servers for NAT traversal
          sendTransport.value = device.value.createSendTransport({
            id: response.id,
            iceParameters: response.iceParameters,
            iceCandidates: response.iceCandidates,
            dtlsParameters: response.dtlsParameters,
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
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
              const response = await new Promise((resolve, reject) => {
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
              // Backend returns { success: true, id: producer.id }
              callback({ id: response.id })
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
      socket.value.emit('create-transport', { 
        meetingId: currentRoomId.value,
        direction: 'recv' 
      }, async (response) => {
        if (response.error) {
          console.error('[WebRTC] Create recv transport failed:', response.error)
          reject(new Error(response.error))
          return
        }

        try {
          // Create WebRTC receive transport with ICE servers for NAT traversal
          recvTransport.value = device.value.createRecvTransport({
            id: response.id,
            iceParameters: response.iceParameters,
            iceCandidates: response.iceCandidates,
            dtlsParameters: response.dtlsParameters,
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
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
   * Produce media (send video/audio/screen to server)
   */
  const produce = async (track, kind, producerType = null) => {
    console.log(`[WebRTC] Producing ${producerType || kind} track:`, track?.id || track)
    
    if (!track) {
      throw new Error(`No ${kind} track provided`)
    }

    if (!sendTransport.value) {
      await createSendTransport()
    }

    try {
      // Determine the producer type (video, audio, or screen)
      const type = producerType || kind
      
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
        appData: { kind, producerType: type },
      })

      producers.value.set(producer.id, { producer, kind, type })
      isProducing.value = true

      producer.on('trackended', () => {
        console.log('[WebRTC] Producer track ended:', producer.id)
        closeProducer(producer.id)
      })

      producer.on('transportclose', () => {
        console.log('[WebRTC] Producer transport closed:', producer.id)
        producers.value.delete(producer.id)
      })

      console.log(`[WebRTC] ✅ Producer created for ${type}:`, producer.id)
      return producer
    } catch (error) {
      console.error('[WebRTC] Failed to produce:', error)
      throw error
    }
  }

  /**
   * Consume media from another participant
   */
  const consume = async (producerId, participantId, producerType = 'video') => {
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

          // Determine if this is a screen share or regular stream
          const isScreenShare = response.producerType === 'screen' || producerType === 'screen'
          
          // Add track to appropriate stream
          let stream
          if (isScreenShare) {
            stream = screenStreams.value.get(participantId)
            if (!stream) {
              stream = new MediaStream()
              screenStreams.value.set(participantId, stream)
            }
          } else {
            stream = remoteStreams.value.get(participantId)
            if (!stream) {
              stream = new MediaStream()
              remoteStreams.value.set(participantId, stream)
            }
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

          console.log('[WebRTC] Consuming', isScreenShare ? 'screen share' : response.kind, 'from:', participantId)
          resolve({ consumer, stream, isScreenShare })
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
    const producerData = producers.value.get(producerId)
    if (producerData) {
      const producer = producerData.producer || producerData
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
    const producerData = producers.value.get(producerId)
    if (producerData) {
      const producer = producerData.producer || producerData
      if (!producer.paused) {
        producer.pause()
        socket.value?.emit('pause-producer', { producerId })
        console.log('[WebRTC] Paused producer:', producerId)
      }
    }
  }

  const resumeProducer = (producerId) => {
    const producerData = producers.value.get(producerId)
    if (producerData) {
      const producer = producerData.producer || producerData
      if (producer.paused) {
        producer.resume()
        socket.value?.emit('resume-producer', { producerId })
        console.log('[WebRTC] Resumed producer:', producerId)
      }
    }
  }

  /**
   * Setup socket event listeners
   */
  const setupSocketListeners = () => {
    if (!socket.value) return

    // New producer available (fixed parameter name: peerId not participantId)
    socket.value.on('new-producer', async ({ producerId, peerId, kind, producerType }) => {
      console.log('[WebRTC] New producer available:', producerType || kind, 'producer:', producerId, 'from peer:', peerId)
      
      // Add participant if not exists
      if (!participants.value.has(peerId)) {
        participants.value.set(peerId, { id: peerId })
      }
      
      try {
        await consume(producerId, peerId, producerType || kind)
        console.log('[WebRTC] ✅ Successfully consuming', producerType || kind, 'from peer:', peerId)
      } catch (error) {
        console.error('[WebRTC] Failed to consume new producer:', error)
      }
    })

    // Peer joined (new user joined the room)
    socket.value.on('peer-joined', async ({ peerId, userName }) => {
      console.log('[WebRTC] Peer joined:', userName, '(', peerId, ')')
      
      // Add to participants
      participants.value.set(peerId, { id: peerId, userName })
    })

    // Producer closed
    socket.value.on('producer-closed', ({ producerId, peerId }) => {
      console.log('[WebRTC] Producer closed:', producerId, 'from:', peerId)
      // Remove track from remote stream
      const stream = remoteStreams.value.get(peerId)
      if (stream) {
        // Clean up tracks
        stream.getTracks().forEach(track => {
          track.stop()
          stream.removeTrack(track)
        })
      }
    })

    // Peer left (fixed event name: peer-left not participant-left)
    socket.value.on('peer-left', ({ peerId, userName }) => {
      console.log('[WebRTC] Peer left:', userName, '(', peerId, ')')
      
      // Remove from participants map
      participants.value.delete(peerId)
      
      // Clean up remote stream
      const stream = remoteStreams.value.get(peerId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        remoteStreams.value.delete(peerId)
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
   * Consume pending producers (called after producing own streams)
   */
  const consumePendingProducers = async () => {
    if (!window._pendingConsumers || window._pendingConsumers.length === 0) {
      console.log('[WebRTC] No pending consumers')
      return
    }

    console.log('[WebRTC] Consuming', window._pendingConsumers.length, 'pending producer(s)')
    
    const pending = [...window._pendingConsumers]
    window._pendingConsumers = []
    
    for (const { producerId, peerId, kind, producerType } of pending) {
      try {
        console.log('[WebRTC] Consuming existing', producerType || kind, 'from peer', peerId)
        await consume(producerId, peerId, producerType || kind)
        console.log('[WebRTC] ✅ Successfully consumed', producerType || kind, 'from peer', peerId)
      } catch (error) {
        console.error('[WebRTC] Failed to consume pending producer:', error)
      }
    }
  }

  /**
   * Leave room and cleanup
   */
  const leaveRoom = () => {
    // Close all producers
    producers.value.forEach((producerData) => {
      const producer = producerData.producer || producerData
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
    
    // Clean up screen share streams
    screenStreams.value.forEach((stream) => {
      stream.getTracks().forEach(track => track.stop())
    })
    screenStreams.value.clear()

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
  const screenSharingParticipants = computed(() => Array.from(screenStreams.value.keys()))

  return {
    // State
    device,
    socket,
    isConnected,
    isProducing,
    producers,
    consumers,
    remoteStreams,
    screenStreams,
    participants,
    producerIds,
    consumerIds,
    remoteParticipants,
    screenSharingParticipants,
    
    // Methods
    initialize,
    joinRoom,
    leaveRoom,
    createSendTransport,
    createRecvTransport,
    produce,
    consume,
    consumePendingProducers,
    closeProducer,
    pauseProducer,
    resumeProducer,
  }
}
