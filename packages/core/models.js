/**
 * Domain models for RotationAtlas implemented as plain JavaScript objects.
 * These models define the shape of information flowing through the system.
 * We avoid TypeScript here to eliminate the need for a build step.  Instead,
 * comments and JSDoc describe the intent of each property.
 */

// Confidence levels used throughout the app
const ConfidenceLevels = {
  UNKNOWN: 'UNKNOWN',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  OK: 'OK',
};

/**
 * Generate a simple unique identifier.  In a real application you might use
 * UUIDs.  This implementation uses a counter to keep identifiers stable
 * across test runs.
 *
 * @param {string} prefix Prefix for the identifier
 * @returns {string} Generated identifier
 */
let _idCounter = 0;
function generateId(prefix = 'id') {
  _idCounter += 1;
  return `${prefix}_${String(_idCounter).padStart(4, '0')}`;
}

module.exports = {
  ConfidenceLevels,
  generateId,
};