#!/bin/bash

capitalize() {
  printf '%s' "$1" | head -c 1 | tr [:lower:] [:upper:]
  printf '%s' "$1" | tail -c '+2'
}

FNAME=$1
FNAME_CAPS=$(capitalize $FNAME)

R1CS=./compiled/$FNAME.r1cs
POT=./pot/pot.ptau

mkdir -p ./compiled
mkdir -p ./contracts/generated

circom ./circuits/$FNAME.circom --r1cs --wasm -o ./compiled

snarkjs plonk setup $R1CS $POT ./compiled/$FNAME.zkey


snarkjs zkey export solidityverifier ./compiled/${FNAME}.zkey ./contracts/generated/${FNAME_CAPS}Verifier.sol
