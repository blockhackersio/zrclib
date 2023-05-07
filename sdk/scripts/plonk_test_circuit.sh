#!/bin/bash

source ./scripts/_paths.sh

echo ""
echo "Generating witness..."
echo "=========================================="
time node $GENERATE_WITNESS $WASM $INPUT $WITNESS

echo ""
echo "Exporting plonk verification key..."
echo "=========================================="
time snarkjs zkey export verificationkey $ZKEY $VKEY

echo ""
echo "Generating plonk proof..."
echo "=========================================="
time snarkjs plonk prove $ZKEY $WITNESS $PROOF $PUBLIC

echo ""
echo "Verifying plonk proof..."
echo "=========================================="
time snarkjs plonk verify $VKEY $PUBLIC $PROOF
