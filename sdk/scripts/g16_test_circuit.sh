#!/bin/bash

source ./scripts/_paths.sh

echo ""
echo "Generating witness..."
echo "=========================================="
time node $GENERATE_WITNESS $WASM $INPUT $WITNESS

echo ""
echo "Generating g16 setup..."
echo "=========================================="
time snarkjs groth16 setup $R1CS $POT $G16ZKEY

echo ""
echo "Exporting g16 verification key..."
echo "=========================================="
time snarkjs zkey export verificationkey $G16ZKEY $VKEY

echo ""
echo "Generating g16 proof..."
echo "=========================================="
time snarkjs groth16 prove $G16ZKEY $WITNESS $PROOF $PUBLIC

echo ""
echo "Verifying g16 proof..."
echo "=========================================="
time snarkjs groth16 verify $VKEY $PUBLIC $PROOF
