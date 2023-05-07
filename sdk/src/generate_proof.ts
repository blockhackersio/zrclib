import { plonk, groth16 } from "snarkjs";
import { getWasmFileLocation, getZkeyFileLocation } from "./key_locator";
import { toFixedHex } from "./utils";

export async function generatePlonkProof(inputs: object) {
  const wasmLocation = getWasmFileLocation();
  const zkeyLocation = getZkeyFileLocation();
  console.log("=generatePlonkProof=========");
  console.log(JSON.stringify(inputs));
  console.log("/generatePlonkProof=========");
  const { proof } = await plonk.fullProve(inputs, wasmLocation, zkeyLocation);
  const calldata: string = await plonk.exportSolidityCallData(proof, []);
  // Calldata comes with the inputs added at the end
  const [proofString] = calldata.split(",");
  return proofString;
}

export async function generateGroth16Proof(inputs: object) {
  const wasmLocation = getWasmFileLocation();
  const zkeyLocation = getZkeyFileLocation();
  console.log("=generateGroth16Proof=========");
  console.log(JSON.stringify(inputs));
  console.log("/generateGroth16Proof=========");
  const { proof } = await groth16.fullProve(inputs, wasmLocation, zkeyLocation);

  return (
    "0x" +
    toFixedHex(proof.pi_a[0]).slice(2) +
    toFixedHex(proof.pi_a[1]).slice(2) +
    toFixedHex(proof.pi_b[0][1]).slice(2) +
    toFixedHex(proof.pi_b[0][0]).slice(2) +
    toFixedHex(proof.pi_b[1][1]).slice(2) +
    toFixedHex(proof.pi_b[1][0]).slice(2) +
    toFixedHex(proof.pi_c[0]).slice(2) +
    toFixedHex(proof.pi_c[1]).slice(2)
  );
}

export type GenerateProofFn = (inputs: object) => Promise<string>;
