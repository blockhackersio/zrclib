/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  DefiantWithdrawal,
  DefiantWithdrawalInterface,
} from "../../contracts/DefiantWithdrawal";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
            internalType: "struct ShieldedPool.ProofArguments",
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
            internalType: "struct ShieldedPool.ExtData",
            name: "extData",
            type: "tuple",
          },
        ],
        internalType: "struct ShieldedPool.Proof",
        name: "_proof",
        type: "tuple",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c060405234801561001057600080fd5b5060405161048738038061048783398101604081905261002f91610062565b6001600160a01b0390811660a05216608052610095565b80516001600160a01b038116811461005d57600080fd5b919050565b6000806040838503121561007557600080fd5b61007e83610046565b915061008c60208401610046565b90509250929050565b60805160a0516103d16100b6600039600050506000605c01526103d16000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063b4f741b514610030575b600080fd5b61004361003e3660046100c6565b610045565b005b60405163b4f741b560e01b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b4f741b5906100919084906004016102d5565b600060405180830381600087803b1580156100ab57600080fd5b505af11580156100bf573d6000803e3d6000fd5b5050505050565b6000602082840312156100d857600080fd5b813567ffffffffffffffff8111156100ef57600080fd5b82016040818503121561010157600080fd5b9392505050565b6000808335601e1984360301811261011f57600080fd5b830160208101925035905067ffffffffffffffff81111561013f57600080fd5b80360382131561014e57600080fd5b9250929050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b80356001600160a01b038116811461019557600080fd5b919050565b6000823561013e198336030181126101b157600080fd5b90910192915050565b60006101406101d9846101cc8561017e565b6001600160a01b03169052565b602083013560208501526101f06040840184610108565b8260408701526102038387018284610155565b925050506102146060840184610108565b8583036060870152610227838284610155565b925050506102376080840161017e565b6001600160a01b0316608085015260a0838101359085015261025b60c0840161017e565b6001600160a01b031660c085015261027560e0840161017e565b6001600160a01b031660e085015261010061029284820185610108565b868403838801526102a4848284610155565b93505050506101206102b881850185610108565b868403838801526102ca848284610155565b979650505050505050565b602081526000823561011e198436030181126102f057600080fd5b6040602084015283016103038180610108565b61012080606087015261031b61018087018385610155565b925060208401356080870152604080850160a088013760406080850160e088013760c084013590860152506001600160a01b0361035a60e0840161017e565b1661014085015261010082013561016085015261037a602086018661019a565b848203601f19016040860152915061039281836101ba565b9594505050505056fea2646970667358221220b27579670251e036f3fb2fc69d8f608421471381c08e167523184d8eaed881bf64736f6c63430008120033";

type DefiantWithdrawalConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DefiantWithdrawalConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DefiantWithdrawal__factory extends ContractFactory {
  constructor(...args: DefiantWithdrawalConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _pool: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DefiantWithdrawal> {
    return super.deploy(
      _pool,
      _token,
      overrides || {}
    ) as Promise<DefiantWithdrawal>;
  }
  override getDeployTransaction(
    _pool: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_pool, _token, overrides || {});
  }
  override attach(address: string): DefiantWithdrawal {
    return super.attach(address) as DefiantWithdrawal;
  }
  override connect(signer: Signer): DefiantWithdrawal__factory {
    return super.connect(signer) as DefiantWithdrawal__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DefiantWithdrawalInterface {
    return new utils.Interface(_abi) as DefiantWithdrawalInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DefiantWithdrawal {
    return new Contract(address, _abi, signerOrProvider) as DefiantWithdrawal;
  }
}
