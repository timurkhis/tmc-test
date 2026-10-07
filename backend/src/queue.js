export const ADD_INTERVAL = 10000;
export const OPERATION_INTERVAL = 1000;

export function createBatchQueue(intervalMs) {
  const pending = [];
  const byKey = new Map();

  function enqueue(run, {key = null, invalidate = false} = {}) {
    const existing = key == null ? undefined : byKey.get(key);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.waiters.push({resolve, reject});
      });
    }
    if (invalidate) {
      for (const [queuedKey, job] of byKey) {
        if (job.read) byKey.delete(queuedKey);
      }
    }
    return new Promise((resolve, reject) => {
      const job = {
        run,
        waiters: [{resolve, reject}],
        read: key != null && !invalidate,
      };
      pending.push(job);
      if (key != null) byKey.set(key, job);
    });
  }

  function flush() {
    const batch = pending.splice(0);
    byKey.clear();
    for (const job of batch) {
      try {
        const result = job.run();
        for (const w of job.waiters) w.resolve(result);
      } catch (error) {
        for (const w of job.waiters) w.reject(error);
      }
    }
  }

  const timer = setInterval(flush, intervalMs);
  timer.unref();

  return {
    enqueue,
    flush,
    stop() {
      clearInterval(timer);
    },
  };
}

export const additions = createBatchQueue(ADD_INTERVAL);
export const operations = createBatchQueue(OPERATION_INTERVAL);
