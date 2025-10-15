import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique meeting ID
 * Format: 10 characters alphanumeric (lowercase)
 */
export function generateMeetingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a UUID
 */
export function generateUUID() {
  return uuidv4();
}

/**
 * Validate meeting ID format
 */
export function isValidMeetingId(meetingId) {
  return /^[a-z0-9]{10}$/.test(meetingId);
}
