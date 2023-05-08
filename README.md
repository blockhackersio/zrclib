<p align="center"><h1 align="center">zrclib 🔮</h1></p>

## Mission

To bring zero knowledge privacy primitives to all web3 developers.

## Disclaimer

This code is unaudited and under construction. This is experimental software and is provided on an "as is" and "as available" basis and may not work at all. This code should not be used in production.

## Roadmap

- [x] ZRC-20 (Token & Payment)
- [x] ZRC-1155 (Payment / Swap / NFTS / Airdrops)
- [x] Defi Swaps
- [x] Defiant Pools Prototype (Zero Knowledge Deposit Addresses pt I)
- [x] Refactor to groth16
- [ ] Implement encrypted store in indexDB
- [ ] Test that utxo store recovers from partial hydration

## Future goals

- [ ] Deposit via proof of deposit (Requires TX proving in Zero Knowledge - possibly with Nova / Halo)
- [ ] Withdrawal via threshold network
- [ ] Refactor and redesign of API
- [ ] CLI creation

### Prerequisites

- pnpm (8.2.0+)
- circom (2.1.5+)
- b2sum (8.3.2+)

### Install dependencies

```
pnpm install
```

### Run tests

```
pnpm test
```

- Run integration tests

### Build project

```
pnpm build
```

- Build circuit artifacts
- Bundle all keys encoded to json files

### Run wallet example

```
pnpm wallet
```

- run the wallet application

## API

```ts
// Get the standard ethers contract
const token = await ethers.Contract(address, abi, signer);

const account = Account.create(token, "password123");
await account.loginWithEthersSigner(signer);

expect(account.isLoggedIn()).toBe(true);

// Generate proof that shields 1 token
// Call the deposit method on the contract which will
// call `transferFrom` to spend 1 of your ERC-20 tokens and
// commit the transaction. If the transfer fails the transaction will fail
const shieldProof = await account.proveShield(1e18);
await token.deposit(shieldProof);

// Generate proof that sends 0.5 tokens to toAddress
const transferProof = await account.proveTransfer(5e17, receiver);

// Call the transfer method on the contract which will
// verify and commit the transaction
await token.tranfer(transferProof);

// Generate proof that burns 0.5 tokens to the receiver address
const unshieldProof = await account.proveUnshield(5e17, receiver);

// Call the withdraw method on the contract which will
// call `transferFrom` to return 0.5 of your ERC-20 tokens to your public account
await token.withdraw(unshieldProof);
```
