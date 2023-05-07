#!/bin/bash

capitalize() {
  printf '%s' "$1" | head -c 1 | tr [:lower:] [:upper:]
  printf '%s' "$1" | tail -c '+2'
}

FNAME=$1

if [ -z "$FNAME" ]; then
  echo "You must provide a circuit name"
  exit 1
fi

FNAME_CAPS=$(capitalize $FNAME)

CIRCUIT=./circuits/$FNAME.circom
R1CS=./compiled/$FNAME.r1cs
POT=./pot/pot.ptau
ZKEY=./compiled/${FNAME}.zkey
SOL_VERIFIER=./contracts/generated/${FNAME_CAPS}Verifier.sol

mkdir -p ./compiled
mkdir -p ./contracts/generated

circom $CIRCUIT --r1cs --wasm -o ./compiled
snarkjs plonk setup $R1CS $POT $ZKEY
snarkjs zkey export solidityverifier $ZKEY $SOL_VERIFIER
