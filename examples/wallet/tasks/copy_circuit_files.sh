#!/bin/sh

# Ideally we would expose a cli that built circuits and managed this
mkdir -p ./public/circuits
cp -r ./node_modules/@zrclib/sdk/compiled/* ./public/circuits
