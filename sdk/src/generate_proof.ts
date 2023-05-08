import { plonk, groth16 } from "snarkjs";
import { getWasmFileLocation, getZkeyFileLocation } from "./key_locator";
import { toFixedHex } from "./utils";
import { AbiCoder } from "ethers/lib/utils";

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
  const abi = new AbiCoder();

  const nums = [
    // from TC
    toFixedHex(proof.pi_a[0]),
    toFixedHex(proof.pi_a[1]),
    toFixedHex(proof.pi_b[0][1]),
    toFixedHex(proof.pi_b[0][0]),
    toFixedHex(proof.pi_b[1][1]),
    toFixedHex(proof.pi_b[1][0]),
    toFixedHex(proof.pi_c[0]),
    toFixedHex(proof.pi_c[1]),
  ];

  const p = abi.encode(
    ["uint", "uint", "uint", "uint", "uint", "uint", "uint", "uint"],
    nums
  );
  console.log({ p, nums });
  return p;
}

export type GenerateProofFn = (inputs: object) => Promise<string>;
