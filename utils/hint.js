/**
 * Runs an assertion and, if it fails, replaces Jest's message with one
 * written for the learner. The stack trace is dropped so the IDE shows
 * only the hint.
 *
 * @param {string} message What the learner should check or fix.
 * @param {() => void} assertion One or more expect() calls.
 */
export function hint(message, assertion) {
  try {
    assertion();
  } catch (error) {
    error.message = message;
    error.stack = null;
    throw error;
  }
}
