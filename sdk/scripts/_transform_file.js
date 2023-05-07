const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

module.exports.transformFile = transformFile;
