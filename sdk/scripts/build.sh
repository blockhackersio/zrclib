#!/bin/bash
if [ -z "$SKIP_CIRCOM" ]; then
  # ./scripts/plonk_compile_circuit.sh transaction
  # node ./scripts/plonk_process_output.js
  ./scripts/g16_compile_circuit.sh transaction
  ./scripts/g16_compile_circuit.sh blocklist
  node ./scripts/g16_process_output.js
  node ./scripts/generate_hasher_contract.js
fi
pnpm tsc
