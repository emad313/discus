import { logger } from '../utils/logger.js';
import { getMediasoupWorkerManager } from '../services/mediasoup/worker.js';
import { createWebRtcTransport, connectTransport } from '../services/mediasoup/transport.js';

// Store room state
const rooms = new Map(); // meetingId -> room data
const peers = new Map(); // socketId -> peer data

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Preview room (get participants without joining)
    socket.on('preview-room', ({ meetingId }) => {
      try {
        logger.info(`Client ${socket.id} previewing room: ${meetingId}`);
        
        // Join a preview room channel to receive updates
        socket.join(`preview-${meetingId}`);
        
        // Send current participants
        const room = rooms.get(meetingId);
        if (room) {
          const participants = Array.from(room.peers.values()).map(peer => ({
            id: peer.socketId,
            userName: peer.userName,
            audioEnabled: peer.producers.has('audio'),
            videoEnabled: peer.producers.has('video'),
          }));
          
          socket.emit('room-participants-update', {
            meetingId,
            participants,
          });
        } else {
          socket.emit('room-participants-update', {
            meetingId,
            participants: [],
          });
        }
      } catch (error) {
        logger.error('Error previewing room:', error);
      }
    });

    // Join meeting room
    socket.on('join-meeting', async ({ meetingId, userName }, callback) => {
      try {
        logger.info(`User ${userName} (${socket.id}) joining meeting: ${meetingId}`);

        // Join socket room
        socket.join(meetingId);

        // Initialize room if it doesn't exist
        if (!rooms.has(meetingId)) {
          const workerManager = getMediasoupWorkerManager();
          const router = await workerManager.createRouter(meetingId);
          
          rooms.set(meetingId, {
            id: meetingId,
            router,
            peers: new Map(),
            hostId: null, // Will be set to first joiner
            isLocked: false, // Meeting lock status
            waitingRoom: new Map(), // socketId -> participant waiting
          });

          logger.info(`Initialized room: ${meetingId}`);
        }

        const room = rooms.get(meetingId);

        // Check if meeting is locked
        if (room.isLocked && room.hostId && room.hostId !== socket.id) {
          logger.info(`Meeting ${meetingId} is locked. ${socket.id} needs admission.`);
          
          // Add to waiting room
          room.waitingRoom.set(socket.id, {
            socketId: socket.id,
            userName,
            timestamp: Date.now(),
          });
          
          // Notify host about knock
          io.to(room.hostId).emit('participant-knock', {
            peerId: socket.id,
            userName,
          });
          
          callback({
            success: false,
            error: 'WAITING_FOR_ADMISSION',
            message: 'Meeting is locked. Waiting for host to admit you...',
          });
          
          return;
        }

        // Assign host if this is the first participant
        if (room.peers.size === 0) {
          room.hostId = socket.id;
          logger.info(`${socket.id} (${userName}) is now the host of room ${meetingId}`);
        }

        // Store peer info
        const isHost = socket.id === room.hostId;
        peers.set(socket.id, {
          socketId: socket.id,
          meetingId,
          userName,
          isHost,
          transports: new Map(),
          producers: new Map(),
          consumers: new Map(),
        });

        room.peers.set(socket.id, peers.get(socket.id));

        // Notify others in the room
        socket.to(meetingId).emit('peer-joined', {
          peerId: socket.id,
          userName,
        });

        // Get list of existing peers with their producers
        const existingPeers = Array.from(room.peers.entries())
          .filter(([id]) => id !== socket.id)
          .map(([id, peer]) => ({
            peerId: id,
            userName: peer.userName,
            producers: Array.from(peer.producers.entries()).map(([producerId, producer]) => ({
              id: producerId,
              kind: producer.kind,
            })),
          }));

        // Send router RTP capabilities
        callback({
          success: true,
          rtpCapabilities: room.router.rtpCapabilities,
          peers: existingPeers,
          isHost: socket.id === room.hostId,
          hostId: room.hostId,
          isLocked: room.isLocked,
        });

        // Emit participant update to preview rooms
        const participants = Array.from(room.peers.values()).map(peer => ({
          id: peer.socketId,
          userName: peer.userName,
          audioEnabled: peer.producers.has('audio'),
          videoEnabled: peer.producers.has('video'),
        }));
        
        io.to(`preview-${meetingId}`).emit('room-participants-update', {
          meetingId,
          participants,
        });

        logger.info(`User ${userName} joined meeting ${meetingId}. Total peers: ${room.peers.size}`);

      } catch (error) {
        logger.error('Error joining meeting:', error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    // Create WebRTC transport
    socket.on('create-transport', async ({ meetingId, direction }, callback) => {
      try {
        const room = rooms.get(meetingId);
        if (!room) {
          throw new Error('Room not found');
        }

        const transportData = await createWebRtcTransport(room.router);
        const peer = peers.get(socket.id);

        // Store transport reference
        peer.transports.set(transportData.id, {
          transport: transportData.transport,
          direction,
        });

        callback({
          success: true,
          id: transportData.id,
          iceParameters: transportData.iceParameters,
          iceCandidates: transportData.iceCandidates,
          dtlsParameters: transportData.dtlsParameters,
        });

        logger.debug(`Created ${direction} transport for peer ${socket.id}`);

      } catch (error) {
        logger.error('Error creating transport:', error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    // Connect transport
    socket.on('connect-transport', async ({ transportId, dtlsParameters }, callback) => {
      try {
        const peer = peers.get(socket.id);
        const transportData = peer.transports.get(transportId);

        if (!transportData) {
          throw new Error('Transport not found');
        }

        await connectTransport(transportData.transport, dtlsParameters);

        callback({ success: true });
        logger.debug(`Connected transport ${transportId} for peer ${socket.id}`);

      } catch (error) {
        logger.error('Error connecting transport:', error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    // Produce media (audio/video)
    socket.on('produce', async ({ transportId, kind, rtpParameters }, callback) => {
      try {
        const peer = peers.get(socket.id);
        const transportData = peer.transports.get(transportId);

        if (!transportData) {
          throw new Error('Transport not found');
        }

        const producer = await transportData.transport.produce({
          kind,
          rtpParameters,
        });

        peer.producers.set(producer.id, producer);

        // Notify other peers about the new producer
        socket.to(peer.meetingId).emit('new-producer', {
          peerId: socket.id,
          producerId: producer.id,
          kind,
        });

        callback({
          success: true,
          id: producer.id,
        });

        logger.info(`Peer ${socket.id} producing ${kind}, producer ID: ${producer.id}`);

      } catch (error) {
        logger.error('Error producing media:', error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    // Consume media from another peer
    socket.on('consume', async ({ producerId, rtpCapabilities, transportId }, callback) => {
      try {
        const peer = peers.get(socket.id);
        const room = rooms.get(peer.meetingId);

        if (!room) {
          throw new Error('Room not found');
        }

        // Find the transport to consume on
        const transportData = peer.transports.get(transportId);
        if (!transportData) {
          throw new Error('Transport not found');
        }

        // Find the producer
        let producer = null;
        let producerPeer = null;
        
        for (const [peerId, peerData] of room.peers.entries()) {
          if (peerData.producers.has(producerId)) {
            producer = peerData.producers.get(producerId);
            producerPeer = peerData;
            break;
          }
        }

        if (!producer) {
          throw new Error('Producer not found');
        }

        // Check if router can consume
        if (!room.router.canConsume({ producerId, rtpCapabilities })) {
          throw new Error('Cannot consume - RTP capabilities mismatch');
        }

        // Create consumer
        const consumer = await transportData.transport.consume({
          producerId,
          rtpCapabilities,
          paused: false,
        });

        peer.consumers.set(consumer.id, consumer);

        callback({
          success: true,
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

        logger.info(`Peer ${socket.id} consuming ${consumer.kind} from producer ${producerId}`);

      } catch (error) {
        logger.error('Error consuming media:', error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    // Resume consumer (required to start receiving media)
    socket.on('resume-consumer', async ({ consumerId }, callback) => {
      try {
        const peer = peers.get(socket.id);
        const consumer = peer.consumers.get(consumerId);

        if (!consumer) {
          throw new Error('Consumer not found');
        }

        await consumer.resume();

        logger.debug(`Resumed consumer ${consumerId} for peer ${socket.id}`);

        if (callback) {
          callback({ success: true });
        }
      } catch (error) {
        logger.error('Error resuming consumer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Leave meeting
    socket.on('leave-meeting', () => {
      handlePeerDisconnect(socket);
    });

    // ========== CHAT EVENTS ==========
    
    // Send chat message
    socket.on('send-message', ({ meetingId, message, timestamp }, callback) => {
      try {
        const peer = peers.get(socket.id);
        if (!peer) {
          return callback({ error: 'Peer not found' });
        }

        const chatMessage = {
          id: `${Date.now()}-${socket.id}`,
          senderId: socket.id,
          senderName: peer.userName,
          message: message.trim(),
          timestamp: timestamp || Date.now(),
          meetingId,
        };

        logger.info(`Chat message from ${peer.userName} in ${meetingId}: ${message}`);

        // Broadcast to all users in the meeting (including sender)
        io.to(meetingId).emit('receive-message', chatMessage);

        callback({ success: true, messageId: chatMessage.id });
      } catch (error) {
        logger.error('Error sending chat message:', error);
        callback({ error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing-start', ({ meetingId }) => {
      const peer = peers.get(socket.id);
      if (peer) {
        socket.to(meetingId).emit('user-typing', {
          userId: socket.id,
          userName: peer.userName,
        });
      }
    });

    socket.on('typing-stop', ({ meetingId }) => {
      const peer = peers.get(socket.id);
      if (peer) {
        socket.to(meetingId).emit('user-stopped-typing', {
          userId: socket.id,
        });
      }
    });

    // ========== END CHAT EVENTS ==========

    // ========== HOST CONTROL EVENTS ==========

    // Lock/Unlock meeting
    socket.on('lock-meeting', ({ meetingId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can lock the meeting' });
          return;
        }

        room.isLocked = true;
        logger.info(`Meeting ${meetingId} locked by host ${socket.id}`);

        // Notify all participants
        io.to(meetingId).emit('meeting-locked', {
          isLocked: true,
          hostId: room.hostId,
        });

        callback({ success: true, isLocked: true });
      } catch (error) {
        logger.error('Error locking meeting:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('unlock-meeting', ({ meetingId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can unlock the meeting' });
          return;
        }

        room.isLocked = false;
        logger.info(`Meeting ${meetingId} unlocked by host ${socket.id}`);

        // Notify all participants
        io.to(meetingId).emit('meeting-locked', {
          isLocked: false,
          hostId: room.hostId,
        });

        callback({ success: true, isLocked: false });
      } catch (error) {
        logger.error('Error unlocking meeting:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Admit participant from waiting room
    socket.on('admit-participant', ({ meetingId, peerId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can admit participants' });
          return;
        }

        const waitingPeer = room.waitingRoom.get(peerId);
        if (!waitingPeer) {
          callback({ success: false, error: 'Participant not in waiting room' });
          return;
        }

        // Remove from waiting room
        room.waitingRoom.delete(peerId);

        // Notify admitted participant
        io.to(peerId).emit('admitted-to-meeting', { meetingId });

        logger.info(`Host ${socket.id} admitted ${peerId} to meeting ${meetingId}`);

        callback({ success: true });
      } catch (error) {
        logger.error('Error admitting participant:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Reject participant from waiting room
    socket.on('reject-participant', ({ meetingId, peerId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can reject participants' });
          return;
        }

        const waitingPeer = room.waitingRoom.get(peerId);
        if (!waitingPeer) {
          callback({ success: false, error: 'Participant not in waiting room' });
          return;
        }

        // Remove from waiting room
        room.waitingRoom.delete(peerId);

        // Notify rejected participant
        io.to(peerId).emit('rejected-from-meeting', { 
          meetingId,
          message: 'The host has denied your request to join'
        });

        logger.info(`Host ${socket.id} rejected ${peerId} from meeting ${meetingId}`);

        callback({ success: true });
      } catch (error) {
        logger.error('Error rejecting participant:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Kick participant
    socket.on('kick-participant', ({ meetingId, peerId, reason }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can kick participants' });
          return;
        }

        // Can't kick yourself
        if (peerId === socket.id) {
          callback({ success: false, error: 'Cannot kick yourself' });
          return;
        }

        // Notify kicked participant
        io.to(peerId).emit('kicked-from-meeting', {
          meetingId,
          reason: reason || 'You have been removed from the meeting',
        });

        logger.info(`Host ${socket.id} kicked ${peerId} from meeting ${meetingId}`);

        callback({ success: true });
      } catch (error) {
        logger.error('Error kicking participant:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Mute participant (force mute their microphone)
    socket.on('mute-participant', ({ meetingId, peerId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can mute participants' });
          return;
        }

        // Notify participant to mute
        io.to(peerId).emit('force-mute', {
          meetingId,
          message: 'The host has muted your microphone',
        });

        logger.info(`Host ${socket.id} muted ${peerId} in meeting ${meetingId}`);

        callback({ success: true });
      } catch (error) {
        logger.error('Error muting participant:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Mute all participants
    socket.on('mute-all', ({ meetingId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can mute all participants' });
          return;
        }

        // Notify all participants except host to mute
        socket.to(meetingId).emit('force-mute', {
          meetingId,
          message: 'The host has muted all participants',
        });

        logger.info(`Host ${socket.id} muted all in meeting ${meetingId}`);

        callback({ success: true });
      } catch (error) {
        logger.error('Error muting all:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Transfer host role
    socket.on('transfer-host', ({ meetingId, newHostId }, callback) => {
      try {
        const room = rooms.get(meetingId);
        const peer = peers.get(socket.id);

        if (!room || !peer) {
          callback({ success: false, error: 'Room or peer not found' });
          return;
        }

        // Verify current host
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can transfer host role' });
          return;
        }

        // Verify new host exists
        if (!room.peers.has(newHostId)) {
          callback({ success: false, error: 'New host not found in meeting' });
          return;
        }

        // Transfer host
        room.hostId = newHostId;
        
        // Update peer objects
        peers.get(socket.id).isHost = false;
        peers.get(newHostId).isHost = true;

        // Notify all participants
        io.to(meetingId).emit('host-changed', {
          oldHostId: socket.id,
          newHostId,
          hostName: room.peers.get(newHostId).userName,
        });

        logger.info(`Host transferred from ${socket.id} to ${newHostId} in meeting ${meetingId}`);

        callback({ success: true, newHostId });
      } catch (error) {
        logger.error('Error transferring host:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ========== END HOST CONTROL EVENTS ==========

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      handlePeerDisconnect(socket);
    });
  });
}

function handlePeerDisconnect(socket) {
  const peer = peers.get(socket.id);
  
  if (!peer) return;

  const { meetingId, userName } = peer;

  // Close all producers
  peer.producers.forEach((producer) => {
    producer.close();
  });

  // Close all consumers
  peer.consumers.forEach((consumer) => {
    consumer.close();
  });

  // Close all transports
  peer.transports.forEach(({ transport }) => {
    transport.close();
  });

  // Remove peer from room
  const room = rooms.get(meetingId);
  if (room) {
    const wasHost = room.hostId === socket.id;
    
    room.peers.delete(socket.id);
    
    // If host left and there are other participants, transfer host to next person
    if (wasHost && room.peers.size > 0) {
      // Get first remaining peer as new host
      const newHostId = Array.from(room.peers.keys())[0];
      room.hostId = newHostId;
      
      // Update peer host status
      const newHostPeer = peers.get(newHostId);
      if (newHostPeer) {
        newHostPeer.isHost = true;
      }
      
      // Notify all participants about new host
      socket.to(meetingId).emit('host-changed', {
        oldHostId: socket.id,
        newHostId,
        hostName: room.peers.get(newHostId)?.userName || 'Unknown',
        reason: 'Previous host left the meeting',
      });
      
      logger.info(`Host transferred from ${socket.id} to ${newHostId} due to disconnect`);
    }
    
    // Notify others
    socket.to(meetingId).emit('peer-left', {
      peerId: socket.id,
      userName,
    });

    // Emit participant update to preview rooms
    const participants = Array.from(room.peers.values()).map(peer => ({
      id: peer.socketId,
      userName: peer.userName,
      audioEnabled: peer.producers.has('audio'),
      videoEnabled: peer.producers.has('video'),
    }));
    
    socket.to(`preview-${meetingId}`).emit('room-participants-update', {
      meetingId,
      participants,
    });

    // Clean up room if empty
    if (room.peers.size === 0) {
      const workerManager = getMediasoupWorkerManager();
      workerManager.closeRouter(meetingId);
      rooms.delete(meetingId);
      logger.info(`Closed empty room: ${meetingId}`);
    }
  }

  // Remove peer data
  peers.delete(socket.id);

  logger.info(`Peer ${socket.id} (${userName}) left meeting ${meetingId}`);
}
