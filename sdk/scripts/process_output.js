const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const FILE_TANSFORMS = [
  {
    filename: "./contracts/generated/TransactionVerifier.sol",
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
  },
];

async function transformFile(specs) {
  for (const spec of specs) {
    process.stdout.write("Transforming " + spec.filename + "... ");
    const filename = path.resolve(process.cwd(), spec.filename);

    const data = await readFile(filename, "utf8");

    const result = spec.edits.reduce(
      (acc, pair) => acc.replace(pair[0], pair[1]),
      data
    );

    await writeFile(filename, result);
    process.stdout.write("done\n");
  }
}

transformFile(FILE_TANSFORMS)
  .then(() => console.log("Verifier Processed Successfully"))
  .catch((err) => console.error(err));
