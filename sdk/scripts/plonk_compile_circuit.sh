#!/bin/bash

source ./scripts/_paths.sh

echo ""
echo "Compile circuit..."
echo "=========================================="
circom $CIRCUIT --r1cs --wasm -o ./compiled

echo ""
echo "Setup plonk..."
echo "=========================================="
snarkjs plonk setup $R1CS $POT $ZKEY

echo ""
echo "Export plonk verifier..."
echo "=========================================="
snarkjs zkey export solidityverifier $ZKEY $SOL_VERIFIER
