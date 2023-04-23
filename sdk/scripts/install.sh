#!/bin/bash

mkdir -p pot

if [ ! -f ./pot/pot.ptau ]; then
  curl -o pot/pot.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_17.ptau
fi

B2_DOWNLOAD=$(b2sum pot/pot.ptau | awk '{ print $1 }')

if [ "$B2_DOWNLOAD" = "6247a3433948b35fbfae414fa5a9355bfb45f56efa7ab4929e669264a0258976741dfbe3288bfb49828e5df02c2e633df38d2245e30162ae7e3bcca5b8b49345" ];then 
  echo "Ptau file has been validated and is correct!"
else
  echo "Danger!!! Powers of Tau file is incorrect. "
  exit 1
fi
