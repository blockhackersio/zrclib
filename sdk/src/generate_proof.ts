import { plonk, groth16 } from "snarkjs";
import { getWasmFileLocation, getZkeyFileLocation } from "./key_locator";

export async function generatePlonkProof(inputs: object) {
  const wasmLocation = getWasmFileLocation();
  const zkeyLocation = getZkeyFileLocation();
  console.log("=generatePlonkProof=========");
  console.log(JSON.stringify(inputs));
  console.log("/generatePlonkProof=========");
  const { proof } = await plonk.fullProve(inputs, wasmLocation, zkeyLocation);
  const calldata = await plonk.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");
  return proofString as string;
}

export async function generateGroth16Proof(inputs: object) {
  const wasmLocation = getWasmFileLocation();
  const zkeyLocation = getZkeyFileLocation();
  console.log("=generateGroth16Proof=========");
  console.log(JSON.stringify(inputs));
  console.log("/generateGroth16Proof=========");
  const { proof } = await groth16.fullProve(inputs, wasmLocation, zkeyLocation);
  const calldata = await groth16.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");
  return proofString as string;
}

export type GenerateProofFn = (inputs: object) => Promise<string>;
