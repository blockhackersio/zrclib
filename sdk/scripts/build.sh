#!/bin/bash
echo "starting"
./scripts/compile_circuit.sh transaction
echo "finished"
node ./scripts/process_output.js
node ./scripts/generate_hasher_contract.js
pnpm tsc
