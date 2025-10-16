import express from 'express';
import { generateMeetingId, isValidMeetingId } from '../utils/generateId.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory storage for meetings (will be replaced with database)
const meetings = new Map();

/**
 * GET /api/meetings/generate
 * Generate a new meeting ID
 */
router.get('/meetings/generate', (req, res) => {
  try {
    const meetingId = generateMeetingId();
    
    // Store meeting metadata
    meetings.set(meetingId, {
      id: meetingId,
      createdAt: new Date().toISOString(),
      participants: [],
      isActive: true,
    });

    logger.info(`Generated new meeting: ${meetingId}`);

    res.json({
      success: true,
      meetingId,
      link: `${req.protocol}://${req.get('host')}/meeting/${meetingId}`,
    });
  } catch (error) {
    logger.error('Error generating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate meeting ID',
    });
  }
});

/**
 * GET /api/meetings/:id
 * Get meeting information
 */
router.get('/meetings/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMeetingId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid meeting ID format',
      });
    }

    const meeting = meetings.get(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    res.json({
      success: true,
      meeting: {
        id: meeting.id,
        createdAt: meeting.createdAt,
        participantCount: meeting.participants.length,
        isActive: meeting.isActive,
      },
    });
  } catch (error) {
    logger.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meeting',
    });
  }
});

/**
 * GET /api/meetings/:id/participants
 * Get current participants in a meeting (for pre-join preview)
 */
router.get('/meetings/:id/participants', (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMeetingId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid meeting ID format',
      });
    }

    // Get participants from socket.io server via shared state
    // For now, return empty array (will be populated by socket.io in real-time)
    const meeting = meetings.get(id);
    
    res.json({
      success: true,
      participants: meeting?.participants || [],
      count: meeting?.participants?.length || 0,
    });
  } catch (error) {
    logger.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants',
    });
  }
});

/**
 * POST /api/meetings/:id/validate
 * Validate if a meeting exists and is active
 */
router.post('/meetings/:id/validate', (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMeetingId(id)) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Invalid meeting ID format',
      });
    }

    const meeting = meetings.get(id);

    if (!meeting) {
      // Create meeting if it doesn't exist (allow ad-hoc meetings)
      meetings.set(id, {
        id,
        createdAt: new Date().toISOString(),
        participants: [],
        isActive: true,
      });

      logger.info(`Created ad-hoc meeting: ${id}`);
    }

    res.json({
      success: true,
      valid: true,
      meeting: {
        id,
        isActive: true,
      },
    });
  } catch (error) {
    logger.error('Error validating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate meeting',
    });
  }
});

// Export meetings map for use by socket.io
export { meetings };
export default router;
