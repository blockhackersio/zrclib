<p align="center"><h1 align="center">zrclib 🔮</h1></p>

## Mission

To bring zero knowledge privacy primitives to all web3 developers.

## Roadmap

- [ ] ZRC-20 (Token & Payment)
- [ ] Stable Coin Example
- [ ] ZRC-1155 (Payment / Swap / NFTS / Airdrops)


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

## API

```ts
// Get the standard ethers contract
const token = await ethers.Contract(address, abi, signer);

const account = Account.fromKeypair(Keypair.generate());

//
const zrc20 = new Zrc20(account);

// Deposit
let proof: Zrc20Proof;

// Generate proof that mints 1 token
proof = await zrc20.mint(1e18, receiver);

// Call the deposit method on the contract which will
// call `transferFrom` to spend 1 of your ERC-20 tokens and
// commit the transaction. If the transfer fails the transaction will fail
token.deposit(proof);

// Generate proof that sends 0.5 tokens to toAddress
proof = await zrc20.transfer(5e17, receiver);

// Call the transfer method on the contract which will
// verify and commit the transaction
token.tranfer(proof);

// Generate proof that burns 0.5 tokens to the receiver address
proof = await zrc20.burn(5e17, receiver);

// Call the withdraw method on the contract which will
// call `transferFrom` to return 0.5 of your ERC-20 tokens to your public account
token.withdraw(proof);

// Generate proof that mints 1 token to the receiver address
proof = await zrc20.mint(1e18, receiver);

// Let's say this function has an onlyOwner modifier
// Assuming the signer is the owner of the contract this call will
// create tokens in the shielded pool in a similar way to OpenZeppelins
// ERC-20 _mint function
token.mint(proof);
```


