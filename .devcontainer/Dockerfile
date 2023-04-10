ARG VARIANT=18-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}
USER root
RUN mkdir -p /home/node/.config && chown -R node:node /home/node/.config
USER node

RUN npm install --location=global pnpm
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y 

# Ensure cargo is now available 
ENV PATH="/home/node/.cargo/bin:$PATH"

# Circom
RUN mkdir -p /tmp/installer-circom && cd /tmp/installer-circom && git clone https://github.com/iden3/circom.git && cd circom && cargo build --release && cargo install --path circom
RUN rm -rf /tmp/installer-circom
RUN npm install -g snarkjs