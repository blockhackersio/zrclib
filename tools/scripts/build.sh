#!/bin/bash

./scripts/compile_circuit.sh transaction
node ./scripts/process_output.js
node ./scripts/generate_hasher_contract.js
pnpm tsc
