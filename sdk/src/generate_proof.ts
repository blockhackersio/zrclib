import { plonk } from "snarkjs";
import { getWasmFileLocation, getZkeyFileLocation } from "./key_locator";

export async function generateProof(inputs: object) {
  const wasmLocation = getWasmFileLocation();
  const zkeyLocation = getZkeyFileLocation();
  console.log("=generateProof=========");
  console.log(JSON.stringify(inputs));
  console.log("/generateProof=========");
  const { proof } = await plonk.fullProve(inputs, wasmLocation, zkeyLocation);
  const calldata = await plonk.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");
  return proofString as string;
}

export type GenerateProofFn = (inputs: object) => Promise<string>;
