import { ethers } from "hardhat";
import { AbiCoder } from "ethers/lib/utils";
import { 
    BlocklistVerifier__factory,
    Blocklist__factory
} from "../typechain-types";
import { toFixedHex } from "@zrclib/sdk";
import { fieldToString, poseidonHash, poseidonHash2 } from "@zrclib/sdk/src/poseidon";
import { buildBlocklistMerkleTree } from "@zrclib/sdk/src/merkle_tree";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { groth16 } from "snarkjs";
import { expect } from "chai";

async function setup() {
    // Prepare signers
    const [deployer] = await ethers.getSigners();

    // Deploy the Verifier
    const verifierFactory = new BlocklistVerifier__factory(deployer);
    const verifier = await verifierFactory.deploy();

    // Deploy the shielded pool passing in the verifier
    const blocklistFactory = new Blocklist__factory(deployer);
    const contract = await blocklistFactory.deploy(
      verifier.address,
    );
  
    return { contract };
}

it("Test update blocklist", async function() {

    let { contract } = await loadFixture(setup);
    const indexToBlock = 8; // a random index value to block the deposit

    // create a sparse merkle tree of level 5, where all leaves are poseidon(0)
    let tree = await buildBlocklistMerkleTree(contract);

    // console.log("Root: ", toFixedHex(tree.root));
    // console.log("Poseidon(0): ", fieldToString(poseidonHash([0])));
    // console.log("Poseidon(1): ", fieldToString(poseidonHash([1])));

    // get the path siblings for the index
    const pathElements = tree.path(indexToBlock).pathElements;

    // get the new root after inserting the blocked leaf at index 8
    const oldRoot = tree.root;
    tree.update(indexToBlock, fieldToString(poseidonHash([1])));
    const newRoot = tree.root;

    // form input
    let input = {
        pathIndices: indexToBlock,
        pathElements: pathElements,
        oldRoot: oldRoot,
        newRoot: newRoot,
    }

    // TODO: integrate this into the SDK
    // generate proof
    const wasmFileLocation = "../sdk/compiled/blocklist_js/blocklist.wasm";
    const zkeyFileLocation = "../sdk/compiled/blocklist.zkey";
    const { proof } = await groth16.fullProve(input, wasmFileLocation, zkeyFileLocation);

    const abi = new AbiCoder();
    const nums = [
        // from TC
        toFixedHex(proof.pi_a[0]),
        toFixedHex(proof.pi_a[1]),
        toFixedHex(proof.pi_b[0][1]), // NOTE ENDIAN DIFFERENCES!
        toFixedHex(proof.pi_b[0][0]),
        toFixedHex(proof.pi_b[1][1]),
        toFixedHex(proof.pi_b[1][0]),
        toFixedHex(proof.pi_c[0]),
        toFixedHex(proof.pi_c[1]),
    ];
    
    const encodedProof = abi.encode(
        ["uint", "uint", "uint", "uint", "uint", "uint", "uint", "uint"],
        nums
    );

    // submit proof to the contract
    await contract.blockDeposit({
        proof: encodedProof,
        oldRoot: toFixedHex(oldRoot),
        newRoot: toFixedHex(newRoot),
    }, indexToBlock);

    // check that index is blocked correctly
    expect(await contract.blockIndices(indexToBlock)).to.equal(true);
})