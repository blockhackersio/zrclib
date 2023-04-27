const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

const isWebWorker =
  typeof self === "object" &&
  self.constructor &&
  self.constructor.name === "DedicatedWorkerGlobalScope";

// Not the best way to do this as these paths should probably
// be injected outside the context but drilling this down might take time
export function getWasmFileLocation() {
  if (isNode && !isWebWorker) {
    return require("path").resolve(
      __dirname,
      `../compiled/transaction_js/transaction.wasm`
    );
  }
  return "/transaction.wasm";
}

export function getZkeyFileLocation() {
  if (isNode && !isWebWorker) {
    return require("path").resolve(__dirname, `../compiled/transaction.zkey`);
  }
  return "/transaction.zkey";
}
