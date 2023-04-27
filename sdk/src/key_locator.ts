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
export function getWasmFileLocation() {
  const base = "/transaction_js/transaction.wasm";
  if (isNode && !isWebWorker) {
    return require("path").resolve(__dirname, `../compiled${base}`);
  }
  return `/circuits${base}`;
}

export function getZkeyFileLocation() {
  const base = "/transaction.zkey";
  if (isNode && !isWebWorker) {
    return require("path").resolve(__dirname, `../compiled${base}`);
  }
  return `/circuits${base}`;
}
