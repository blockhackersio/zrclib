const { transformFile } = require("./_transform_file");

const FILE_TANSFORMS = [
  {
    filename: "./contracts/generated/TransactionVerifier.sol",
    edits: [[`contract Verifier`, `contract TransactionVerifier`]],
  },
];

transformFile(FILE_TANSFORMS)
  .then(() => console.log("Verifier Processed Successfully"))
  .catch((err) => console.error(err));
