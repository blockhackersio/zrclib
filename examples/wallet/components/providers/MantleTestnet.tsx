import { Chain } from '@wagmi/core';

export const mantle = {
    id: 5001,
    name: 'mantle',
    network: 'mantle',
    nativeCurrency: {
      decimals: 18,
      name: 'Mantle',
      symbol: 'BIT',
    },
    rpcUrls: {
      public: { http: ['https://rpc.testnet.mantle.xyz'] },
      default: { http: ['https://rpc.testnet.mantle.xyz'] },
    },
    blockExplorers: {
      default: { name: 'Mantle', url: 'https://explorer.testnet.mantle.xyz/' },
    },
} as const satisfies Chain