/**
 * Create a promise that resolves after the specified number of ms.
 * @param {number} ms - The number of ms to wait before resolving the promise.
 * @returns {Promise<void>} - Promise that resolves after the specified timeout.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve: () => void) => {
    window.setTimeout(resolve, ms);
  });
}
