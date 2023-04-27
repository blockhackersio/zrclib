import * as Comlink from "comlink";
import { GenerateProofFn } from "@zrclib/sdk";

export function getProver() {
  if (typeof Worker === "undefined") return undefined;

  return Comlink.wrap<GenerateProofFn>(
    new Worker(new URL("./worker.ts", import.meta.url))
  );
}
