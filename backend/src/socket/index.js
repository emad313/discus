import { logger } from '../utils/logger.js';
import { getMediasoupWorkerManager } from '../services/mediasoup/worker.js';
import { createWebRtcTransport, connectTransport } from '../services/mediasoup/transport.js';

// Store room state
const rooms = new Map(); // meetingId -> room data
const peers = new Map(); // socketId -> peer data

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

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
          });

          logger.info(`Initialized room: ${meetingId}`);
        }

        const room = rooms.get(meetingId);

        // Store peer info
        peers.set(socket.id, {
          socketId: socket.id,
          meetingId,
          userName,
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

        // Get list of existing peers
        const existingPeers = Array.from(room.peers.entries())
          .filter(([id]) => id !== socket.id)
          .map(([id, peer]) => ({
            peerId: id,
            userName: peer.userName,
          }));

        // Send router RTP capabilities
        callback({
          success: true,
          rtpCapabilities: room.router.rtpCapabilities,
          peers: existingPeers,
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

    // Leave meeting
    socket.on('leave-meeting', () => {
      handlePeerDisconnect(socket);
    });

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
    room.peers.delete(socket.id);
    
    // Notify others
    socket.to(meetingId).emit('peer-left', {
      peerId: socket.id,
      userName,
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
