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

if [ ! -f "$CIRCUIT" ]; then
  echo "$CIRCUIT must exist."
  exit 1
fi

G16ZKEY=./compiled/${FNAME}.zkey
GENERATE_WITNESS=./compiled/${FNAME}_js/generate_witness.js
INPUT=./tests/$FNAME.json
POT=./pot/pot.ptau
PROOF=./compiled/${FNAME}_proof.json
PUBLIC=./compiled/${FNAME}_public.json
R1CS=./compiled/$FNAME.r1cs
SOL_VERIFIER=./contracts/generated/${FNAME_CAPS}Verifier.sol
VKEY=./compiled/${FNAME}_verification_key.json
WASM=./compiled/${FNAME}_js/$FNAME.wasm
WITNESS=./compiled/$FNAME.wtns
ZKEY=./compiled/${FNAME}.zkey

mkdir -p ./compiled
mkdir -p ./contracts/generated
