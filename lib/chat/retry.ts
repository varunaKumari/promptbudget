export async function withRetry<T>({
  operation,
  retries = 2,
  baseDelayMs = 150,
}: {
  operation: () => Promise<T>;
  retries?: number;
  baseDelayMs?: number;
}): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
