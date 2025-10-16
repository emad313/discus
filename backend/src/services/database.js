import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'discus',
  user: process.env.POSTGRES_USER || 'discus',
  password: process.env.POSTGRES_PASSWORD || 'discus',
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  logger.info('[Database] PostgreSQL client connected');
});

pool.on('error', (err) => {
  logger.error('[Database] Unexpected error on idle client', err);
});

/**
 * Save chat message to database
 */
export async function saveChatMessage({ meetingId, participantId, username, message }) {
  const query = `
    INSERT INTO chat_messages (meeting_id, participant_id, username, message)
    VALUES ($1, $2, $3, $4)
    RETURNING id, sent_at
  `;
  
  try {
    const result = await pool.query(query, [meetingId, participantId, username, message]);
    logger.debug(`[Database] Chat message saved: ${result.rows[0].id}`);
    return result.rows[0];
  } catch (error) {
    logger.error('[Database] Error saving chat message:', error);
    throw error;
  }
}

/**
 * Get chat history for a meeting
 */
export async function getChatHistory(meetingId, limit = 100) {
  const query = `
    SELECT id, participant_id, username, message, sent_at
    FROM chat_messages
    WHERE meeting_id = $1
    ORDER BY sent_at ASC
    LIMIT $2
  `;
  
  try {
    const result = await pool.query(query, [meetingId, limit]);
    logger.debug(`[Database] Retrieved ${result.rows.length} chat messages for meeting ${meetingId}`);
    return result.rows;
  } catch (error) {
    logger.error('[Database] Error getting chat history:', error);
    throw error;
  }
}

/**
 * Create or update meeting record
 */
export async function createMeeting(meetingId, hostId) {
  const query = `
    INSERT INTO meetings (id, host_id, started_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (id) DO UPDATE
    SET started_at = NOW(), is_active = TRUE
    RETURNING id, created_at
  `;
  
  try {
    const result = await pool.query(query, [meetingId, hostId]);
    logger.info(`[Database] Meeting created/updated: ${meetingId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('[Database] Error creating meeting:', error);
    throw error;
  }
}

/**
 * End meeting
 */
export async function endMeeting(meetingId) {
  const query = `
    UPDATE meetings
    SET ended_at = NOW(), is_active = FALSE
    WHERE id = $1
    RETURNING id
  `;
  
  try {
    const result = await pool.query(query, [meetingId]);
    if (result.rows.length > 0) {
      logger.info(`[Database] Meeting ended: ${meetingId}`);
      return result.rows[0];
    }
    return null;
  } catch (error) {
    logger.error('[Database] Error ending meeting:', error);
    throw error;
  }
}

/**
 * Add participant to meeting
 */
export async function addParticipant(meetingId, socketId, username, isHost = false) {
  const query = `
    INSERT INTO participants (meeting_id, user_id, username, is_host)
    VALUES ($1, $2, $3, $4)
    RETURNING id, joined_at
  `;
  
  try {
    const result = await pool.query(query, [meetingId, socketId, username, isHost]);
    logger.debug(`[Database] Participant added: ${username} to meeting ${meetingId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('[Database] Error adding participant:', error);
    throw error;
  }
}

/**
 * Mark participant as left
 */
export async function removeParticipant(participantId) {
  const query = `
    UPDATE participants
    SET left_at = NOW()
    WHERE id = $1
    RETURNING id
  `;
  
  try {
    const result = await pool.query(query, [participantId]);
    if (result.rows.length > 0) {
      logger.debug(`[Database] Participant left: ${participantId}`);
      return result.rows[0];
    }
    return null;
  } catch (error) {
    logger.error('[Database] Error removing participant:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  await pool.end();
  logger.info('[Database] Connection pool closed');
}

export default pool;
