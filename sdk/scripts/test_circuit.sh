#!/bin/bash

capitalize() {
  printf '%s' "$1" | head -c 1 | tr [:lower:] [:upper:]
  printf '%s' "$1" | tail -c '+2'
}

FNAME=$1
FNAME_CAPS=$(capitalize $FNAME)

# locations

GENERATE_WITNESS=./compiled/${FNAME}_js/generate_witness.js
WASM=./compiled/${FNAME}_js/$FNAME.wasm
INPUT=./tests/$FNAME.json
WITNESS=./compiled/$FNAME.wtns
ZKEY=./compiled/${FNAME}.zkey
VKEY=./compiled/${FNAME}_verification_key.json
PROOF=./compiled/${FNAME}_proof.json
PUBLIC=./compiled/${FNAME}_public.json
R1CS=./compiled/$FNAME.r1cs
POT=./pot/pot.ptau
G16ZKEY=./compiled/${FNAME}_g16.zkey

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

echo ""
echo "Generating g16 setup..."
echo "=========================================="
time snarkjs groth16 setup $R1CS $POT $G16ZKEY

echo ""
echo "Exporting g16 verification key..."
echo "=========================================="
time snarkjs zkey export verificationkey $G16ZKEY $VKEY

echo ""
echo "Generating groth16 proof..."
echo "=========================================="
time snarkjs groth16 prove $G16ZKEY $WITNESS $PROOF $PUBLIC

echo ""
echo "Verifying groth16 proof..."
echo "=========================================="
time snarkjs groth16 verify $VKEY $PUBLIC $PROOF
