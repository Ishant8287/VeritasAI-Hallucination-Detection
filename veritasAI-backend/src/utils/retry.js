/**
 * Retries an async function on transient failures (429, 5xx, network errors).
 *
 * @param {Function} fn        — async function to execute
 * @param {Object}   options
 * @param {number}   options.retries — number of retry attempts (default 2)
 * @param {number}   options.delay   — base delay in ms, multiplied by attempt (default 1000)
 * @returns {Promise<*>}
 */
export const withRetry = async (fn, { retries = 2, delay = 1000 } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw err;

      const isRetryable =
        err.status === 429 ||
        (err.status && err.status >= 500) ||
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND";

      if (!isRetryable) throw err;

      const waitMs = delay * (attempt + 1);
      console.warn(
        `Retry ${attempt + 1}/${retries} after ${waitMs}ms — ${err.message || err.code}`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
};
