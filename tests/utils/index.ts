export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function time(log: string) {
  const started = Date.now();
  console.log(`${log}... `);
  return started;
}

export function tend(started: number) {
  console.log(` └─ ${Date.now() - started}ms`);
}
