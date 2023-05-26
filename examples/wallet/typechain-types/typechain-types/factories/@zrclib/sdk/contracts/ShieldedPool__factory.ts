/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  ShieldedPool,
  ShieldedPoolInterface,
} from "../../../../@zrclib/sdk/contracts/ShieldedPool";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_levels",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "_hasher",
        type: "address",
      },
      {
        internalType: "address",
        name: "_verifier",
        type: "address",
      },
      {
        internalType: "address",
        name: "_swapExecutor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "encryptedOutput",
        type: "bytes",
      },
    ],
    name: "NewCommitment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "nullifier",
        type: "bytes32",
      },
    ],
    name: "NewNullifier",
    type: "event",
  },
  {
    inputs: [],
    name: "FIELD_SIZE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_EXT_AMOUNT",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROOT_HISTORY_SIZE",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ZERO_VALUE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentRootIndex",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "filledSubtrees",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_left",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_right",
        type: "bytes32",
      },
    ],
    name: "hashLeftRight",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasher",
    outputs: [
      {
        internalType: "contract IHasher",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_root",
        type: "bytes32",
      },
    ],
    name: "isKnownRoot",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_nullifierHash",
        type: "bytes32",
      },
    ],
    name: "isSpent",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "levels",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextIndex",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nullifierHashes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "parseProof",
    outputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "roots",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "swapExecutor",
    outputs: [
      {
        internalType: "contract SwapExecutor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "bytes",
                name: "proof",
                type: "bytes",
              },
              {
                internalType: "bytes32",
                name: "root",
                type: "bytes32",
              },
              {
                internalType: "bytes32[2]",
                name: "inputNullifiers",
                type: "bytes32[2]",
              },
              {
                internalType: "bytes32[2]",
                name: "outputCommitments",
                type: "bytes32[2]",
              },
              {
                internalType: "uint256",
                name: "publicAmount",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "publicAsset",
                type: "address",
              },
              {
                internalType: "bytes32",
                name: "extDataHash",
                type: "bytes32",
              },
            ],
            internalType: "struct AbstractShieldedPool.ProofArguments",
            name: "proofArguments",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "int256",
                name: "extAmount",
                type: "int256",
              },
              {
                internalType: "bytes",
                name: "encryptedOutput1",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "encryptedOutput2",
                type: "bytes",
              },
              {
                internalType: "address",
                name: "tokenOut",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "swapRecipient",
                type: "address",
              },
              {
                internalType: "address",
                name: "swapRouter",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "swapData",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "transactData",
                type: "bytes",
              },
            ],
            internalType: "struct AbstractShieldedPool.ExtData",
            name: "extData",
            type: "tuple",
          },
        ],
        internalType: "struct AbstractShieldedPool.Proof",
        name: "_proof",
        type: "tuple",
      },
    ],
    name: "transact",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "bytes",
                name: "proof",
                type: "bytes",
              },
              {
                internalType: "bytes32",
                name: "root",
                type: "bytes32",
              },
              {
                internalType: "bytes32[2]",
                name: "inputNullifiers",
                type: "bytes32[2]",
              },
              {
                internalType: "bytes32[2]",
                name: "outputCommitments",
                type: "bytes32[2]",
              },
              {
                internalType: "uint256",
                name: "publicAmount",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "publicAsset",
                type: "address",
              },
              {
                internalType: "bytes32",
                name: "extDataHash",
                type: "bytes32",
              },
            ],
            internalType: "struct AbstractShieldedPool.ProofArguments",
            name: "proofArguments",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "int256",
                name: "extAmount",
                type: "int256",
              },
              {
                internalType: "bytes",
                name: "encryptedOutput1",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "encryptedOutput2",
                type: "bytes",
              },
              {
                internalType: "address",
                name: "tokenOut",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amountOutMin",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "swapRecipient",
                type: "address",
              },
              {
                internalType: "address",
                name: "swapRouter",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "swapData",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "transactData",
                type: "bytes",
              },
            ],
            internalType: "struct AbstractShieldedPool.ExtData",
            name: "extData",
            type: "tuple",
          },
        ],
        internalType: "struct AbstractShieldedPool.Proof",
        name: "_proof",
        type: "tuple",
      },
    ],
    name: "transactAndSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier",
    outputs: [
      {
        internalType: "contract TransactionVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "zeros",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c0604052600280546001600160401b0319169055600160f81b6003553480156200002957600080fd5b5060405162002e2d38038062002e2d8339810160408190526200004c9162000892565b838360008263ffffffff1611620000b65760405162461bcd60e51b815260206004820152602360248201527f5f6c6576656c732073686f756c642062652067726561746572207468616e207a60448201526265726f60e81b60648201526084015b60405180910390fd5b60208263ffffffff16106200010e5760405162461bcd60e51b815260206004820152601e60248201527f5f6c6576656c732073686f756c64206265206c657373207468616e20333200006044820152606401620000ad565b63ffffffff90911660a0526001600160a01b03908116608052600680548483166001600160a01b03199182161790915560058054928416929091169190911790556200015962000163565b505050506200092b565b60005b60a05163ffffffff168163ffffffff161015620001b9576200018e63ffffffff8216620001fb565b63ffffffff821660009081526020819052604090205580620001b081620008f9565b91505062000166565b5060a051620001ce9063ffffffff16620001fb565b6000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4955565b6000816000036200022d57507f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c919050565b816001036200025d57507f13e37f2d6cb86c78ccc1788607c2b199788c6bb0a615a21f2e7a8e88384222f8919050565b816002036200028d57507f217126fa352c326896e8c2803eec8fd63ad50cf65edfef27a41a9e32dc622765919050565b81600303620002bd57507f0e28a61a9b3e91007d5a9e3ada18e1b24d6d230c618388ee5df34cacd7397eee919050565b81600403620002ed57507f27953447a6979839536badc5425ed15fadb0e292e9bc36f92f0aa5cfa5013587919050565b816005036200031d57507f194191edbfb91d10f6a7afd315f33095410c7801c47175c2df6dc2cce0e3affc919050565b816006036200034d57507f1733dece17d71190516dbaf1927936fa643dc7079fc0cc731de9d6845a47741f919050565b816007036200037d57507f267855a7dc75db39d81d17f95d0a7aa572bf5ae19f4db0e84221d2b2ef999219919050565b81600803620003ad57507f1184e11836b4c36ad8238a340ecc0985eeba665327e33e9b0e3641027c27620d919050565b81600903620003dd57507f0702ab83a135d7f55350ab1bfaa90babd8fc1d2b3e6a7215381a7b2213d6c5ce919050565b81600a036200040d57507f2eecc0de814cfd8c57ce882babb2e30d1da56621aef7a47f3291cffeaec26ad7919050565b81600b036200043d57507f280bc02145c155d5833585b6c7b08501055157dd30ce005319621dc462d33b47919050565b81600c036200046d57507f045132221d1fa0a7f4aed8acd2cbec1e2189b7732ccb2ec272b9c60f0d5afc5b919050565b81600d036200049d57507f27f427ccbf58a44b1270abbe4eda6ba53bd6ac4d88cf1e00a13c4371ce71d366919050565b81600e03620004cd57507f1617eaae5064f26e8f8a6493ae92bfded7fde71b65df1ca6d5dcec0df70b2cef919050565b81600f03620004fd57507f20c6b400d0ea1b15435703c31c31ee63ad7ba5c8da66cec2796feacea575abca919050565b816010036200052d57507f09589ddb438723f53a8e57bdada7c5f8ed67e8fece3889a73618732965645eec919050565b816011036200055c57507e64b6a738a5ff537db7b220f3394f0ecbd35bfd355c5425dc1166bf3236079b919050565b816012036200058c57507f095de56281b1d5055e897c3574ff790d5ee81dbc5df784ad2d67795e557c9e9f919050565b81601303620005bc57507f11cf2e2887aa21963a6ec14289183efe4d4c60f14ecd3d6fe0beebdf855a9b63919050565b81601403620005ec57507f2b0f6fc0179fa65b6f73627c0e1e84c7374d2eaec44c9a48f2571393ea77bcbb919050565b816015036200061c57507f16fdb637c2abf9c0f988dbf2fd64258c46fb6a273d537b2cf1603ea460b13279919050565b816016036200064c57507f21bbd7e944f6124dad4c376df9cc12e7ca66e47dff703ff7cedb1a454edcf0ff919050565b816017036200067c57507f2784f8220b1c963e468f590f137baaa1625b3b92a27ad9b6e84eb0d3454d9962919050565b81601803620006ac57507f16ace1a65b7534142f8cc1aad810b3d6a7a74ca905d9c275cb98ba57e509fc10919050565b81601903620006dc57507f2328068c6a8c24265124debd8fe10d3f29f0665ea725a65e3638f6192a96a013919050565b81601a036200070c57507f2ddb991be1f028022411b4c4d2c22043e5e751c120736f00adf54acab1c9ac14919050565b81601b036200073c57507f0113798410eaeb95056a464f70521eb58377c0155f2fe518a5594d38cc209cc0919050565b81601c036200076c57507f202d1ae61526f0d0d01ef80fb5d4055a7af45721024c2c24cffd6a3798f54d50919050565b81601d036200079c57507f23ab323453748129f2765f79615022f5bebd6f4096a796300aab049a60b0f187919050565b81601e03620007cc57507f1f15585f8947e378bcf8bd918716799da909acdb944c57150b1eb4565fda8aa0919050565b81601f03620007fc57507f1eb064b21055ac6a350cf41eb30e4ce2cb19680217df3a243617c2838185ad06919050565b816020036200082c57507f25a90efc49af54a5b7154a6eaba978dcf04796b4984fe54be8d4ea8579e1f1e6919050565b60405162461bcd60e51b815260206004820152601360248201527f496e646578206f7574206f6620626f756e6473000000000000000000000000006044820152606401620000ad565b919050565b80516001600160a01b03811681146200087557600080fd5b60008060008060808587031215620008a957600080fd5b845163ffffffff81168114620008be57600080fd5b9350620008ce602086016200087a565b9250620008de604086016200087a565b9150620008ee606086016200087a565b905092959194509250565b600063ffffffff8083168181036200092157634e487b7160e01b600052601160045260246000fd5b6001019392505050565b60805160a0516124c762000966600039600081816101da015281816116be015261177b015260008181610341015261048701526124c76000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c806384fcec46116100b8578063e5285dcc1161007c578063e5285dcc146102df578063e829558814610302578063ec73295914610315578063ed33639f1461033c578063f178e47c14610363578063fc7e9c6f1461038357600080fd5b806384fcec461461027757806390eeb02b1461028a578063ba70f7571461029a578063c2b40ae4146102b7578063cd87a3b4146102d757600080fd5b806362274329116100ff57806362274329146102115780636d9833e31461022657806375d8498f14610239578063793deea31461024c5780637fe24ffe1461026e57600080fd5b806317cc915c1461013c5780632b7ac3f31461017457806338bf282e1461019f578063414a37ba146101c05780634ecf518b146101d5575b600080fd5b61015f61014a366004611918565b60046020526000908152604090205460ff1681565b60405190151581526020015b60405180910390f35b600654610187906001600160a01b031681565b6040516001600160a01b03909116815260200161016b565b6101b26101ad366004611931565b61039b565b60405190815260200161016b565b6101b260008051602061247283398151915281565b6101fc7f000000000000000000000000000000000000000000000000000000000000000081565b60405163ffffffff909116815260200161016b565b61022461021f366004611953565b61050f565b005b61015f610234366004611918565b6105a4565b610224610247366004611953565b610622565b61025f61025a366004611aa8565b6109b0565b60405161016b93929190611b57565b6101b260035481565b600554610187906001600160a01b031681565b6002546101fc9063ffffffff1681565b60025463ffffffff166000908152600160205260409020546101b2565b6101b26102c5366004611918565b60016020526000908152604090205481565b6101fc606481565b61015f6102ed366004611918565b60009081526004602052604090205460ff1690565b6101b2610310366004611918565b610a0f565b6101b27f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c81565b6101877f000000000000000000000000000000000000000000000000000000000000000081565b6101b2610371366004611918565b60006020819052908152604090205481565b6002546101fc90640100000000900463ffffffff1681565b600060008051602061247283398151915283106103ff5760405162461bcd60e51b815260206004820181905260248201527f5f6c6566742073686f756c6420626520696e7369646520746865206669656c6460448201526064015b60405180910390fd5b60008051602061247283398151915282106104665760405162461bcd60e51b815260206004820152602160248201527f5f72696768742073686f756c6420626520696e7369646520746865206669656c6044820152601960fa1b60648201526084016103f6565b61046e6118cd565b8381526020810183905260405163014cf2b360e51b81527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063299e5660906104c4908490600401611b9e565b602060405180830381865afa1580156104e1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105059190611bcf565b9150505b92915050565b6005546001600160a01b03166105286020830183611be8565b610536906020810190611c20565b6001600160a01b0316036105985760405162461bcd60e51b8152602060048201526024808201527f726563697069656e742073686f756c64206e6f742062652073776170457865636044820152633aba37b960e11b60648201526084016103f6565b6105a181611062565b50565b60008181036105b557506000919050565b60025463ffffffff16805b63ffffffff811660009081526001602052604090205484036105e6575060019392505050565b8063ffffffff166000036105f8575060645b8061060281611c51565b9150508163ffffffff168163ffffffff16036105c0575060009392505050565b60006106316020830183611be8565b60200135126106825760405162461bcd60e51b815260206004820152601c60248201527f657874416d6f756e742073686f756c64206265206e656761746976650000000060448201526064016103f6565b600061068e8280611c71565b6106a09061010081019060e001611c20565b6001600160a01b0316036106f65760405162461bcd60e51b815260206004820152601d60248201527f7075626c696341737365742073686f756c64206e6f742062652030783000000060448201526064016103f6565b6106ff81611062565b6005546001600160a01b03166107186020830183611be8565b610726906020810190611c20565b6001600160a01b0316146107875760405162461bcd60e51b815260206004820152602260248201527f6f6e6c7920737761704578656375746f722063616e20626520726563697069656044820152611b9d60f21b60648201526084016103f6565b60006107966020830183611be8565b6107a79060a0810190608001611c20565b6001600160a01b0316036107fd5760405162461bcd60e51b815260206004820152601a60248201527f746f6b656e4f75742073686f756c64206e6f742062652030783000000000000060448201526064016103f6565b600061080c6020830183611be8565b60a001351161086b5760405162461bcd60e51b815260206004820152602560248201527f616d6f756e744f75744d696e2073686f756c6420626520677265617465722074604482015264068616e20360dc1b60648201526084016103f6565b6005546001600160a01b031663a0c6a6ef6108868380611c71565b6108989061010081019060e001611c20565b6108a56020850185611be8565b6108b69060a0810190608001611c20565b6108c36020860186611be8565b602001356108d090611c88565b6108dd6020870187611be8565b60a001356108ee6020880188611be8565b6109009061010081019060e001611c20565b61090d6020890189611be8565b61091e9060e081019060c001611c20565b61092b60208a018a611be8565b61093a90610100810190611ca4565b61094760208c018c611be8565b61095690610120810190611ca4565b6040518b63ffffffff1660e01b815260040161097b9a99989796959493929190611d1b565b600060405180830381600087803b15801561099557600080fd5b505af11580156109a9573d6000803e3d6000fd5b5050505050565b6109b86118cd565b6109c06118eb565b6109c86118cd565b838060200190518101906109dc9190611d8d565b895160208b8101518b820193909352928a5281830193909352929092528082019290925291905285015283529193909250565b600081600003610a4057507f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c919050565b81600103610a6f57507f13e37f2d6cb86c78ccc1788607c2b199788c6bb0a615a21f2e7a8e88384222f8919050565b81600203610a9e57507f217126fa352c326896e8c2803eec8fd63ad50cf65edfef27a41a9e32dc622765919050565b81600303610acd57507f0e28a61a9b3e91007d5a9e3ada18e1b24d6d230c618388ee5df34cacd7397eee919050565b81600403610afc57507f27953447a6979839536badc5425ed15fadb0e292e9bc36f92f0aa5cfa5013587919050565b81600503610b2b57507f194191edbfb91d10f6a7afd315f33095410c7801c47175c2df6dc2cce0e3affc919050565b81600603610b5a57507f1733dece17d71190516dbaf1927936fa643dc7079fc0cc731de9d6845a47741f919050565b81600703610b8957507f267855a7dc75db39d81d17f95d0a7aa572bf5ae19f4db0e84221d2b2ef999219919050565b81600803610bb857507f1184e11836b4c36ad8238a340ecc0985eeba665327e33e9b0e3641027c27620d919050565b81600903610be757507f0702ab83a135d7f55350ab1bfaa90babd8fc1d2b3e6a7215381a7b2213d6c5ce919050565b81600a03610c1657507f2eecc0de814cfd8c57ce882babb2e30d1da56621aef7a47f3291cffeaec26ad7919050565b81600b03610c4557507f280bc02145c155d5833585b6c7b08501055157dd30ce005319621dc462d33b47919050565b81600c03610c7457507f045132221d1fa0a7f4aed8acd2cbec1e2189b7732ccb2ec272b9c60f0d5afc5b919050565b81600d03610ca357507f27f427ccbf58a44b1270abbe4eda6ba53bd6ac4d88cf1e00a13c4371ce71d366919050565b81600e03610cd257507f1617eaae5064f26e8f8a6493ae92bfded7fde71b65df1ca6d5dcec0df70b2cef919050565b81600f03610d0157507f20c6b400d0ea1b15435703c31c31ee63ad7ba5c8da66cec2796feacea575abca919050565b81601003610d3057507f09589ddb438723f53a8e57bdada7c5f8ed67e8fece3889a73618732965645eec919050565b81601103610d5e57507e64b6a738a5ff537db7b220f3394f0ecbd35bfd355c5425dc1166bf3236079b919050565b81601203610d8d57507f095de56281b1d5055e897c3574ff790d5ee81dbc5df784ad2d67795e557c9e9f919050565b81601303610dbc57507f11cf2e2887aa21963a6ec14289183efe4d4c60f14ecd3d6fe0beebdf855a9b63919050565b81601403610deb57507f2b0f6fc0179fa65b6f73627c0e1e84c7374d2eaec44c9a48f2571393ea77bcbb919050565b81601503610e1a57507f16fdb637c2abf9c0f988dbf2fd64258c46fb6a273d537b2cf1603ea460b13279919050565b81601603610e4957507f21bbd7e944f6124dad4c376df9cc12e7ca66e47dff703ff7cedb1a454edcf0ff919050565b81601703610e7857507f2784f8220b1c963e468f590f137baaa1625b3b92a27ad9b6e84eb0d3454d9962919050565b81601803610ea757507f16ace1a65b7534142f8cc1aad810b3d6a7a74ca905d9c275cb98ba57e509fc10919050565b81601903610ed657507f2328068c6a8c24265124debd8fe10d3f29f0665ea725a65e3638f6192a96a013919050565b81601a03610f0557507f2ddb991be1f028022411b4c4d2c22043e5e751c120736f00adf54acab1c9ac14919050565b81601b03610f3457507f0113798410eaeb95056a464f70521eb58377c0155f2fe518a5594d38cc209cc0919050565b81601c03610f6357507f202d1ae61526f0d0d01ef80fb5d4055a7af45721024c2c24cffd6a3798f54d50919050565b81601d03610f9257507f23ab323453748129f2765f79615022f5bebd6f4096a796300aab049a60b0f187919050565b81601e03610fc157507f1f15585f8947e378bcf8bd918716799da909acdb944c57150b1eb4565fda8aa0919050565b81601f03610ff057507f1eb064b21055ac6a350cf41eb30e4ce2cb19680217df3a243617c2838185ad06919050565b8160200361101f57507f25a90efc49af54a5b7154a6eaba978dcf04796b4984fe54be8d4ea8579e1f1e6919050565b60405162461bcd60e51b8152602060048201526013602482015272496e646578206f7574206f6620626f756e647360681b60448201526064016103f6565b919050565b61107861106f8280611c71565b602001356105a4565b6110ba5760405162461bcd60e51b8152602060048201526013602482015272125b9d985b1a59081b595c9adb19481c9bdbdd606a1b60448201526064016103f6565b60005b6110c78280611c71565b5060028110156111645761110c6110de8380611c71565b60400182600281106110f2576110f2611b88565b602002013560009081526004602052604090205460ff1690565b156111525760405162461bcd60e51b8152602060048201526016602482015275125b9c1d5d081a5cc8185b1c9958591e481cdc195b9d60521b60448201526064016103f6565b8061115c81611dea565b9150506110bd565b506000805160206124728339815191526111816020830183611be8565b6040516020016111919190611e49565b6040516020818303038152906040528051906020012060001c6111b49190611fa1565b6111be8280611c71565b6101000135146112105760405162461bcd60e51b815260206004820152601c60248201527f496e636f72726563742065787465726e616c206461746120686173680000000060448201526064016103f6565b60035461121c90611c88565b6112296020830183611be8565b6020013513801561124b57506003546112456020830183611be8565b60200135125b61128f5760405162461bcd60e51b8152602060048201526015602482015274125b9d985b1a59081c1d589b1a58c8185b5bdd5b9d605a1b60448201526064016103f6565b6112a061129b8261211b565b611587565b6112dc5760405162461bcd60e51b815260206004820152600d60248201526c24b73b30b634b210383937b7b360991b60448201526064016103f6565b60005b6112e98280611c71565b506002811015611354576001600460006113038580611c71565b604001846002811061131757611317611b88565b6020020135815260200190815260200160002060006101000a81548160ff021916908315150217905550808061134c90611dea565b9150506112df565b5060006113646020830183611be8565b6020013512156113e157600061137d6020830183611be8565b61138b906020810190611c20565b6001600160a01b0316036113e15760405162461bcd60e51b815260206004820152601e60248201527f43616e277420776974686472617720746f207a65726f2061646472657373000060448201526064016103f6565b6114056113ee8280611c71565b608001356113fc8380611c71565b60a001356116a1565b50600280546114229190640100000000900463ffffffff1661220e565b63ffffffff166114328280611c71565b608001357ff3843eddcfcac65d12d9f26261dab50671fdbf5dc44441816c8bbdace2411afd6114646020850185611be8565b611472906040810190611ca4565b604051611480929190612232565b60405180910390a36002546114a590600190640100000000900463ffffffff1661220e565b63ffffffff166114b58280611c71565b60a001357ff3843eddcfcac65d12d9f26261dab50671fdbf5dc44441816c8bbdace2411afd6114e76020850185611be8565b6114f5906060810190611ca4565b604051611503929190612232565b60405180910390a360005b6115188280611c71565b5060028110156115835761152c8280611c71565b604001816002811061154057611540611b88565b60200201357f5e58f77bbf94b46d8d896e29753e4458c6e59b48581e20ed58c9558e96f297ce60405160405180910390a28061157b81611dea565b91505061150e565b5050565b604080516101008101825282516020908101518252835160809081015182840152845160a0908101516001600160a01b031684860152855160c0908101516060808701919091528751870151519386019390935286519095015183015190840152845181015151938301939093528351909201519091015160e08201528151516000919082908190819061161a906109b0565b600654604051636490cd3d60e11b815293965091945092506001600160a01b03169063c9219a7a90611656908690869086908a90600401612246565b602060405180830381865afa158015611673573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061169791906122a3565b9695505050505050565b6002805460009164010000000090910463ffffffff16906116e3907f0000000000000000000000000000000000000000000000000000000000000000906123d6565b63ffffffff168163ffffffff16036117565760405162461bcd60e51b815260206004820152603060248201527f4d65726b6c6520747265652069732066756c6c2e204e6f206d6f7265206c656160448201526f1d995cc818d85b88189948185919195960821b60648201526084016103f6565b60006117636002836123eb565b90506000611771868661039b565b905060008060015b7f000000000000000000000000000000000000000000000000000000000000000063ffffffff168163ffffffff16101561183d576117b860028661240e565b63ffffffff166000036117f6578392506117d78163ffffffff16610a0f565b63ffffffff821660009081526020819052604090208590559150611812565b63ffffffff811660009081526020819052604090205492508391505b61181c838361039b565b93506118296002866123eb565b94508061183581612431565b915050611779565b506002546000906064906118589063ffffffff166001612454565b611862919061240e565b6002805463ffffffff191663ffffffff831690811782556000908152600160205260409020869055909150611898908790612454565b6002805463ffffffff929092166401000000000267ffffffff0000000019909216919091179055509394505050505092915050565b60405180604001604052806002906020820280368337509192915050565b60405180604001604052806002905b6119026118cd565b8152602001906001900390816118fa5790505090565b60006020828403121561192a57600080fd5b5035919050565b6000806040838503121561194457600080fd5b50508035926020909101359150565b60006020828403121561196557600080fd5b813567ffffffffffffffff81111561197c57600080fd5b82016040818503121561198e57600080fd5b9392505050565b634e487b7160e01b600052604160045260246000fd5b6040805190810167ffffffffffffffff811182821017156119ce576119ce611995565b60405290565b604051610140810167ffffffffffffffff811182821017156119ce576119ce611995565b60405160e0810167ffffffffffffffff811182821017156119ce576119ce611995565b600082601f830112611a2c57600080fd5b813567ffffffffffffffff80821115611a4757611a47611995565b604051601f8301601f19908116603f01168101908282118183101715611a6f57611a6f611995565b81604052838152866020858801011115611a8857600080fd5b836020870160208301376000602085830101528094505050505092915050565b600060208284031215611aba57600080fd5b813567ffffffffffffffff811115611ad157600080fd5b61050584828501611a1b565b8060005b6002811015611b00578151845260209384019390910190600101611ae1565b50505050565b806000805b6002808210611b1a57506109a9565b835186845b83811015611b3d578251825260209283019290910190600101611b1f565b505050604095909501945060209290920191600101611b0b565b6101008101611b668286611add565b611b736040830185611b06565b611b8060c0830184611add565b949350505050565b634e487b7160e01b600052603260045260246000fd5b60408101818360005b6002811015611bc6578151835260209283019290910190600101611ba7565b50505092915050565b600060208284031215611be157600080fd5b5051919050565b6000823561013e19833603018112611bff57600080fd5b9190910192915050565b80356001600160a01b038116811461105d57600080fd5b600060208284031215611c3257600080fd5b61198e82611c09565b634e487b7160e01b600052601160045260246000fd5b600063ffffffff821680611c6757611c67611c3b565b6000190192915050565b6000823561011e19833603018112611bff57600080fd5b6000600160ff1b8201611c9d57611c9d611c3b565b5060000390565b6000808335601e19843603018112611cbb57600080fd5b83018035915067ffffffffffffffff821115611cd657600080fd5b602001915036819003821315611ceb57600080fd5b9250929050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6001600160a01b038b811682528a81166020830152604082018a9052606082018990528781166080830152861660a082015261010060c08201819052600090611d678382018789611cf2565b905082810360e0840152611d7c818587611cf2565b9d9c50505050505050505050505050565b600080600080600080600080610100898b031215611daa57600080fd5b505086516020880151604089015160608a015160808b015160a08c015160c08d015160e0909d0151959e949d50929b919a50985090965094509092509050565b600060018201611dfc57611dfc611c3b565b5060010190565b6000808335601e19843603018112611e1a57600080fd5b830160208101925035905067ffffffffffffffff811115611e3a57600080fd5b803603821315611ceb57600080fd5b60208152611e6a60208201611e5d84611c09565b6001600160a01b03169052565b602082013560408201526000611e836040840184611e03565b610140806060860152611e9b61016086018385611cf2565b9250611eaa6060870187611e03565b9250601f1980878603016080880152611ec4858584611cf2565b9450611ed260808901611c09565b6001600160a01b03811660a0890152935060a088013560c0880152611ef960c08901611c09565b6001600160a01b03811660e08901529350611f1660e08901611c09565b93506101009150611f31828801856001600160a01b03169052565b611f3d82890189611e03565b94509150610120818887030181890152611f58868685611cf2565b9550611f66818a018a611e03565b955092505080878603018388015250611f80848483611cf2565b979650505050505050565b634e487b7160e01b600052601260045260246000fd5b600082611fb057611fb0611f8b565b500690565b600082601f830112611fc657600080fd5b611fce6119ab565b806040840185811115611fe057600080fd5b845b81811015611ffa578035845260209384019301611fe2565b509095945050505050565b6000610140828403121561201857600080fd5b6120206119d4565b905061202b82611c09565b815260208201356020820152604082013567ffffffffffffffff8082111561205257600080fd5b61205e85838601611a1b565b6040840152606084013591508082111561207757600080fd5b61208385838601611a1b565b606084015261209460808501611c09565b608084015260a084013560a08401526120af60c08501611c09565b60c08401526120c060e08501611c09565b60e0840152610100915081840135818111156120db57600080fd5b6120e786828701611a1b565b83850152506101209150818401358181111561210257600080fd5b61210e86828701611a1b565b8385015250505092915050565b60006040823603121561212d57600080fd5b6121356119ab565b823567ffffffffffffffff8082111561214d57600080fd5b8185019150610120823603121561216357600080fd5b61216b6119f8565b82358281111561217a57600080fd5b61218636828601611a1b565b825250602083013560208201526121a03660408501611fb5565b60408201526121b23660808501611fb5565b606082015260c083013560808201526121cd60e08401611c09565b60a082015261010083013560c08201528084525060208501359150808211156121f557600080fd5b5061220236828601612005565b60208301525092915050565b63ffffffff82811682821603908082111561222b5761222b611c3b565b5092915050565b602081526000611b80602083018486611cf2565b61020081016122558287611add565b6122626040830186611b06565b61226f60c0830185611add565b61010082018360005b6008811015612297578151835260209283019290910190600101612278565b50505095945050505050565b6000602082840312156122b557600080fd5b8151801515811461198e57600080fd5b600181815b80851115612302578163ffffffff048211156122e8576122e8611c3b565b808516156122f557918102915b93841c93908002906122ca565b509250929050565b60008261231957506001610509565b8161232657506000610509565b816001811461233c576002811461234657612377565b6001915050610509565b60ff84111561235757612357611c3b565b6001841b915063ffffffff82111561237157612371611c3b565b50610509565b5060208310610133831016604e8410600b84101617156123ae575081810a63ffffffff8111156123a9576123a9611c3b565b610509565b6123b883836122c5565b8063ffffffff048211156123ce576123ce611c3b565b029392505050565b600063ffffffff61050581851682851661230a565b600063ffffffff8084168061240257612402611f8b565b92169190910492915050565b600063ffffffff8084168061242557612425611f8b565b92169190910692915050565b600063ffffffff80831681810361244a5761244a611c3b565b6001019392505050565b63ffffffff81811683821601908082111561222b5761222b611c3b56fe30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001a264697066735822122002dc0177cf9542bcbed8cb527fdd0593d04689db23c18193dd99e9d0d615f75464736f6c63430008120033";

type ShieldedPoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ShieldedPoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ShieldedPool__factory extends ContractFactory {
  constructor(...args: ShieldedPoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _levels: PromiseOrValue<BigNumberish>,
    _hasher: PromiseOrValue<string>,
    _verifier: PromiseOrValue<string>,
    _swapExecutor: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ShieldedPool> {
    return super.deploy(
      _levels,
      _hasher,
      _verifier,
      _swapExecutor,
      overrides || {}
    ) as Promise<ShieldedPool>;
  }
  override getDeployTransaction(
    _levels: PromiseOrValue<BigNumberish>,
    _hasher: PromiseOrValue<string>,
    _verifier: PromiseOrValue<string>,
    _swapExecutor: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _levels,
      _hasher,
      _verifier,
      _swapExecutor,
      overrides || {}
    );
  }
  override attach(address: string): ShieldedPool {
    return super.attach(address) as ShieldedPool;
  }
  override connect(signer: Signer): ShieldedPool__factory {
    return super.connect(signer) as ShieldedPool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ShieldedPoolInterface {
    return new utils.Interface(_abi) as ShieldedPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ShieldedPool {
    return new Contract(address, _abi, signerOrProvider) as ShieldedPool;
  }
}
