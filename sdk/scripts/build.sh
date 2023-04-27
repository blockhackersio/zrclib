#!/bin/bash
if [ -z "$SKIP_CIRCOM" ]; then
  ./scripts/compile_circuit.sh transaction
  node ./scripts/process_output.js
  node ./scripts/generate_hasher_contract.js
fi
pnpm tsc
