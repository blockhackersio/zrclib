import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
export default {
  input: "src/index.ts",
  output: [
    {
      dir: "dist",
      format: "cjs",
      exports: "auto",
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    json(),
    commonjs(),
    typescript({
      declaration: true,
      declarationDir: "dist",
      include: "**/*.ts",
      compilerOptions: { lib: ["es5", "es6", "dom"], target: "es5" },
    }),
    resolve({
      preferBuiltins: false,
    }),
  ],
  onwarn(warning, warn) {
    // Silence known error message caused by ethers.js library
    if (warning.code === "THIS_IS_UNDEFINED") return;

    warn(warning);
  },
  external: [
    // add any external dependencies here
  ],
};
