#!/bin/sh

# Ideally we would expose a cli that built circuits and managed this
mkdir -p ./public/circuits
cp -r ./node_modules/@zrclib/sdk/compiled/transaction* ./public/circuits
cp ../../tests/artifacts/contracts/mocks/MockErc20.sol/MockErc20.json ./contracts/
cp ../../tests/artifacts/contracts/MultiAssetShieldedPool.sol/MultiAssetShieldedPool.json ./contracts/
cp ../../tests/artifacts/contracts/mocks/MockSwapRouter.sol/MockSwapRouter.json ./contracts/
cp ../../tests/artifacts/@zrclib/sdk/contracts/SwapExecutor.sol/SwapExecutor.json ./contracts/
cp -r ../../tests/typechain-types ./typechain-types
