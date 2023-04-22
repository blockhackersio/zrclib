#!/bin/bash

mkdir -p pot

if [ ! -f ./pot/pot.ptau ]; then
  curl -o pot/pot.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau
fi

B2_DOWNLOAD=$(b2sum pot/pot.ptau | awk '{ print $1 }')

if [ "$B2_DOWNLOAD" = "6a6277a2f74e1073601b4f9fed6e1e55226917efb0f0db8a07d98ab01df1ccf43eb0e8c3159432acd4960e2f29fe84a4198501fa54c8dad9e43297453efec125" ];then 
  echo "Ptau file has been validated and is correct!"
else
  echo "Danger!!! Powers of Tau file is incorrect. "
  exit 1
fi
