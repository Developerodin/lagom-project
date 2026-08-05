/**
 * Rejects if `promise` does not settle within `ms`.
 * Clears the timer when the original promise wins to avoid leaked handles.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Operation timed out",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
