// This works asfar as I can tell
export const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export const isWebWorker =
  typeof self === "object" &&
  self.constructor &&
  self.constructor.name === "DedicatedWorkerGlobalScope";

// Not the best way to do this as these paths should
// be injected outside the context but drilling this
// down might take time so doing it this way for now
export function getWasmFileLocation(circuitName: string) {
  const base = `/${circuitName}_js/${circuitName}.wasm`;
  if (isNode && !isWebWorker) {
    return require("path").resolve(__dirname, `../compiled${base}`);
  }
  return `/circuits${base}`;
}

export function getZkeyFileLocation(circuitName: string) {
  const base = `/${circuitName}.zkey`;
  if (isNode && !isWebWorker) {
    return require("path").resolve(__dirname, `../compiled${base}`);
  }
  return `/circuits${base}`;
}
