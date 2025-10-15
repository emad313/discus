import { mediasoupConfig } from '../../config/mediasoup.js';
import { logger } from '../../utils/logger.js';

/**
 * Create a WebRTC transport for sending or receiving media
 */
export async function createWebRtcTransport(router) {
  const { listenIps, enableUdp, enableTcp, preferUdp, initialAvailableOutgoingBitrate, minimumAvailableOutgoingBitrate, maxIncomingBitrate } = mediasoupConfig.webRtcTransport;

  try {
    const transport = await router.createWebRtcTransport({
      listenIps,
      enableUdp,
      enableTcp,
      preferUdp,
      initialAvailableOutgoingBitrate,
      minimumAvailableOutgoingBitrate,
      maxIncomingBitrate,
    });

    logger.debug(`Created WebRTC transport: ${transport.id}`);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      transport,
    };
  } catch (error) {
    logger.error('Error creating WebRTC transport:', error);
    throw error;
  }
}

/**
 * Connect a transport with DTLS parameters
 */
export async function connectTransport(transport, dtlsParameters) {
  try {
    await transport.connect({ dtlsParameters });
    logger.debug(`Transport connected: ${transport.id}`);
  } catch (error) {
    logger.error('Error connecting transport:', error);
    throw error;
  }
}
