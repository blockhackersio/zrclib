/** @type {import('next').NextConfig} */
// The following might only be required for noir:
const { O_TRUNC, O_CREAT, O_RDWR, O_EXCL, O_RDONLY } = require("constants");
const VirtualModulesPlugin = require("webpack-virtual-modules");
const constants = `
export const O_TRUNC = ${O_TRUNC};
export const O_CREAT = ${O_CREAT};
export const O_RDWR = ${O_RDWR};
export const O_EXCL = ${O_EXCL};
export const O_RDONLY = ${O_RDONLY}
`;
const empty = "export default {}";
module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };

    config.plugins.push(
      new VirtualModulesPlugin({
        "../node_modules/fs.mjs": empty,
        "../node_modules/os.mjs": empty,
        "../node_modules/crypto.mjs": empty,
        "../node_modules/readline.mjs": empty,
        "../node_modules/ejs.mjs": empty,
        "../node_modules/encoding.mjs": empty,
        "../node_modules/constants.mjs": constants,
      })
    );
    return config;
  },
};
