export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function time(log: string) {
  const started = Date.now();
  console.log(`${log}... `);
  return started;
}

export function tend(started: number) {
  console.log(` └─ ${Date.now() - started}ms`);
}

export async function waitUntil<T>(
  task: () => Promise<T>,
  isEqual: (v: T) => boolean,
  timeout = 10_000
) {
  let start = Date.now();

  while (true) {
    if (start + timeout < Date.now()) {
      throw new Error("Value was expected to be equal after timeout");
    }
    const actual = await task();
    if (isEqual(actual)) {
      break;
    }

    await sleep(500);
  }
}
