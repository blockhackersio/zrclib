#!/bin/bash

./scripts/compile_circuit.sh transaction
./scripts/compile_circuit.sh multitransaction
node ./scripts/process_output.js
node ./scripts/generate_hasher_contract.js
pnpm tsc
