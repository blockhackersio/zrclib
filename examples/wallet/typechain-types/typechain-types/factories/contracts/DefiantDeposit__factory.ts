/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  DefiantDeposit,
  DefiantDepositInterface,
} from "../../contracts/DefiantDeposit";

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
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c060405234801561001057600080fd5b506040516109d23803806109d283398101604081905261002f9161006c565b6001600160a01b0390811660a052166080526000805460ff1916905561009f565b80516001600160a01b038116811461006757600080fd5b919050565b6000806040838503121561007f57600080fd5b61008883610050565b915061009660208401610050565b90509250929050565b60805160a0516108eb6100e76000396000818161013b0152818161036c0152818161043d01526104d101526000818161020b01528181610280015261040d01526108eb6000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806377a299721461003b578063a9059cbb14610050575b600080fd5b61004e610049366004610544565b610063565b005b61004e61005e3660046105a2565b610275565b600061007260208301836105cc565b60200135136100d25760405162461bcd60e51b815260206004820152602160248201527f657874416d6f756e74206d75737420696e6469636174652061206465706f73696044820152601d60fa1b60648201526084015b60405180910390fd5b6000805460ff1660028111156100ea576100ea6105ed565b1461012c5760405162461bcd60e51b8152602060048201526012602482015271737461746520776173206e6f742049444c4560701b60448201526064016100c9565b6000805460ff191660011790557f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166323b872dd333061017760208601866105cc565b6040516001600160e01b031960e086901b1681526001600160a01b0393841660048201529290911660248301526020013560448201526064016020604051808303816000875af11580156101cf573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101f39190610603565b50604051633bd14cb960e11b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906377a29972906102409084906004016107d6565b600060405180830381600087803b15801561025a57600080fd5b505af115801561026e573d6000803e3d6000fd5b5050505050565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146102f95760405162461bcd60e51b815260206004820152602360248201527f4f6e6c7920706f6f6c2063616e206578656375746520746869732066756e637460448201526234b7b760e91b60648201526084016100c9565b600160005460ff166002811115610312576103126105ed565b146103545760405162461bcd60e51b815260206004820152601260248201527114dd185d19481dd85cc81b9bdd081195531360721b60448201526064016100c9565b6040516370a0823160e01b81523060048201526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa1580156103bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103df919061089c565b90508181116103f6576000805460ff191660021790555b60405163095ea7b360e01b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000008116600483015260001960248301527f0000000000000000000000000000000000000000000000000000000000000000169063095ea7b3906044016020604051808303816000875af1158015610486573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104aa9190610603565b5060405163a9059cbb60e01b81526001600160a01b038481166004830152602482018490527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303816000875af115801561051a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061053e9190610603565b50505050565b60006020828403121561055657600080fd5b813567ffffffffffffffff81111561056d57600080fd5b82016040818503121561057f57600080fd5b9392505050565b80356001600160a01b038116811461059d57600080fd5b919050565b600080604083850312156105b557600080fd5b6105be83610586565b946020939093013593505050565b6000823561013e198336030181126105e357600080fd5b9190910192915050565b634e487b7160e01b600052602160045260246000fd5b60006020828403121561061557600080fd5b8151801515811461057f57600080fd5b6000808335601e1984360301811261063c57600080fd5b830160208101925035905067ffffffffffffffff81111561065c57600080fd5b80360382131561066b57600080fd5b9250929050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6000823561013e198336030181126106b257600080fd5b90910192915050565b60006101406106da846106cd85610586565b6001600160a01b03169052565b602083013560208501526106f16040840184610625565b8260408701526107048387018284610672565b925050506107156060840184610625565b8583036060870152610728838284610672565b9250505061073860808401610586565b6001600160a01b0316608085015260a0838101359085015261075c60c08401610586565b6001600160a01b031660c085015261077660e08401610586565b6001600160a01b031660e085015261010061079384820185610625565b868403838801526107a5848284610672565b93505050506101206107b981850185610625565b868403838801526107cb848284610672565b979650505050505050565b602081526000823561011e198436030181126107f157600080fd5b6040602084015283016108048180610625565b61012080606087015261081c61018087018385610672565b925060208401356080870152604080850160a088013760406080850160e088013760c084013590860152506001600160a01b0361085b60e08401610586565b1661014085015261010082013561016085015261087b602086018661069b565b848203601f19016040860152915061089381836106bb565b95945050505050565b6000602082840312156108ae57600080fd5b505191905056fea2646970667358221220f98cdb34d4b2a91c27ea95a74ed05fee217a7987cf7a46deecb5642f2f884dd664736f6c63430008120033";

type DefiantDepositConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DefiantDepositConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DefiantDeposit__factory extends ContractFactory {
  constructor(...args: DefiantDepositConstructorParams) {
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
  ): Promise<DefiantDeposit> {
    return super.deploy(
      _pool,
      _token,
      overrides || {}
    ) as Promise<DefiantDeposit>;
  }
  override getDeployTransaction(
    _pool: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_pool, _token, overrides || {});
  }
  override attach(address: string): DefiantDeposit {
    return super.attach(address) as DefiantDeposit;
  }
  override connect(signer: Signer): DefiantDeposit__factory {
    return super.connect(signer) as DefiantDeposit__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DefiantDepositInterface {
    return new utils.Interface(_abi) as DefiantDepositInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DefiantDeposit {
    return new Contract(address, _abi, signerOrProvider) as DefiantDeposit;
  }
}
