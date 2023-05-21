import { ethers } from "hardhat";
import { 
    BlocklistVerifier__factory,
    Blocklist__factory
} from "../typechain-types";
import { toFixedHex } from "@zrclib/sdk";
import { fieldToString, poseidonHash } from "@zrclib/sdk/src/poseidon";
import { buildBlocklistMerkleTree } from "@zrclib/sdk/src/merkle_tree";
import { generateGroth16Proof } from "@zrclib/sdk";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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

    // generate proof
    const proof = await generateGroth16Proof(input, "blocklist");

    // submit proof to the contract
    await contract.blockDeposit({
        proof: proof,
        oldRoot: toFixedHex(oldRoot),
        newRoot: toFixedHex(newRoot),
    }, indexToBlock);

    // check that index is blocked correctly
    expect(await contract.blockIndices(indexToBlock)).to.equal(true);
})