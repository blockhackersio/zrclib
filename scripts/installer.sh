# install circom
pnpm install

# rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# clone circom repo
git clone https://github.com/iden3/circom.git

cd circom
cargo build --release
cargo install --path circom
pnpm install -g snarkjs

# install b2sum
