const fs = require("fs");
const path = require("path");

const TransactionVerifier = {
  filename: "./contracts/transaction_verifier.sol",
  edits: [
    [`contract PlonkVerifier`, `contract TransactionVerifier`],
    [
      `        assembly {`,
      `        bool result;
        assembly {`,
    ],
    [
      `            mstore(0, isValid)
            return(0,0x20)
        }
        
    }
}`,
      `            mstore(0, isValid)
            result := mload(0)
        }
        return result;
    }
}`,
    ],
  ],
};

async function transformFile(transformationSpec) {
  return new Promise((resolve, reject) => {
    const filename = path.resolve(process.cwd(), transformationSpec.filename);

    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        return reject();
      }

      const result = transformationSpec.edits.reduce(
        (acc, pair) => acc.replace(pair[0], pair[1]),
        data
      );

      fs.writeFile(filename, result, (err) => {
        if (err) return reject();
        resolve("ok");
      });
    });
  });
}

transformFile(TransactionVerifier)
  .then(() => console.log("Verifier Processed Successfully"))
  .catch((err) => console.error(err));
