const fs = require('fs');
const path = require('path');
const { poseidonContract: poseidonGenContract } = require("circomlibjs");
const outputPath = path.join(__dirname, '..', 'contracts', 'generated');
const outputFile = path.join(outputPath, 'Hasher.json');

const contract = {
    _format: 'hh-sol-artifact-1',
    sourceName: 'contracts/Hasher.sol',
    linkReferences: {},
    deployedLinkReferences: {},
    contractName: 'Hasher',
    abi: poseidonGenContract.generateABI(2),
    bytecode: poseidonGenContract.createCode(2),
    deployedBytecode: poseidonGenContract.createCode(2),
}

fs.writeFileSync(outputFile, JSON.stringify(contract, null, 2));