const { transformFile } = require("./_transform_file");

const FILE_TANSFORMS = [
  {
    filename: "./contracts/generated/TransactionVerifier.sol",
    edits: [
      [`contract Verifier`, `contract TransactionVerifier`],
      [`pragma solidity ^0.6.11;`, `pragma solidity ^0.8.0;`],
    ],
  },
];

transformFile(FILE_TANSFORMS)
  .then(() => console.log("Verifier Processed Successfully"))
  .catch((err) => console.error(err));
