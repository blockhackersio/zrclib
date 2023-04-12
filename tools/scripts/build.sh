#!/bin/bash

./scripts/compile_circuit.sh transaction
node ./scripts/process_output.js
rollup -c