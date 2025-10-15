import mediasoup from 'mediasoup';
import { mediasoupConfig } from '../../config/mediasoup.js';
import { logger } from '../../utils/logger.js';

class MediasoupWorkerManager {
  constructor() {
    this.workers = [];
    this.nextWorkerIndex = 0;
    this.routers = new Map(); // meetingId -> router
  }

  async createWorkers() {
    const { numWorkers, worker: workerConfig } = mediasoupConfig;

    logger.info(`Creating ${numWorkers} Mediasoup workers...`);

    for (let i = 0; i < numWorkers; i++) {
      try {
        const worker = await mediasoup.createWorker({
          logLevel: workerConfig.logLevel,
          logTags: workerConfig.logTags,
          rtcMinPort: workerConfig.rtcMinPort,
          rtcMaxPort: workerConfig.rtcMaxPort,
        });

        worker.on('died', (error) => {
          logger.error(`Mediasoup worker ${i} died:`, error);
          process.exit(1);
        });

        this.workers.push(worker);
        logger.info(`Worker ${i} created [pid:${worker.pid}]`);

      } catch (error) {
        logger.error(`Failed to create worker ${i}:`, error);
        throw error;
      }
    }

    logger.info(`Successfully created ${this.workers.length} workers`);
  }

  getWorker() {
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  async createRouter(meetingId) {
    if (this.routers.has(meetingId)) {
      logger.debug(`Router already exists for meeting: ${meetingId}`);
      return this.routers.get(meetingId);
    }

    const worker = this.getWorker();
    const router = await worker.createRouter({
      mediaCodecs: mediasoupConfig.router.mediaCodecs,
    });

    this.routers.set(meetingId, router);
    logger.info(`Created router for meeting: ${meetingId}`);

    return router;
  }

  getRouter(meetingId) {
    return this.routers.get(meetingId);
  }

  async closeRouter(meetingId) {
    const router = this.routers.get(meetingId);
    if (router) {
      router.close();
      this.routers.delete(meetingId);
      logger.info(`Closed router for meeting: ${meetingId}`);
    }
  }

  getWorkerStats() {
    return this.workers.map((worker, index) => ({
      index,
      pid: worker.pid,
      closed: worker.closed,
    }));
  }
}

// Singleton instance
const workerManager = new MediasoupWorkerManager();

export async function initializeMediasoup() {
  await workerManager.createWorkers();
}

export function getMediasoupWorkerManager() {
  return workerManager;
}
