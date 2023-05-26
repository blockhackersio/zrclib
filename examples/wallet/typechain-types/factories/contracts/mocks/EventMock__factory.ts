/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  EventMock,
  EventMockInterface,
} from "../../../contracts/mocks/EventMock";

const _abi = [
  {
    inputs: [],
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
    inputs: [
      {
        internalType: "bytes32",
        name: "_commitment",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_encryptedOutput",
        type: "bytes",
      },
    ],
    name: "newCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_nullifier",
        type: "bytes32",
      },
    ],
    name: "newNullifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506101d0806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806366a2c8e11461003b578063bde1132c14610050575b600080fd5b61004e6100493660046100d2565b610063565b005b61004e61005e3660046100eb565b610091565b60405181907f5e58f77bbf94b46d8d896e29753e4458c6e59b48581e20ed58c9558e96f297ce90600090a250565b82847ff3843eddcfcac65d12d9f26261dab50671fdbf5dc44441816c8bbdace2411afd84846040516100c492919061016b565b60405180910390a350505050565b6000602082840312156100e457600080fd5b5035919050565b6000806000806060858703121561010157600080fd5b8435935060208501359250604085013567ffffffffffffffff8082111561012757600080fd5b818701915087601f83011261013b57600080fd5b81358181111561014a57600080fd5b88602082850101111561015c57600080fd5b95989497505060200194505050565b60208152816020820152818360408301376000818301604090810191909152601f909201601f1916010191905056fea2646970667358221220c3dd91315ac500ca20554acf74e658a32a8183c9e60347c4fb2c80f4aac15d3b64736f6c63430008120033";

type EventMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: EventMockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class EventMock__factory extends ContractFactory {
  constructor(...args: EventMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<EventMock> {
    return super.deploy(overrides || {}) as Promise<EventMock>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): EventMock {
    return super.attach(address) as EventMock;
  }
  override connect(signer: Signer): EventMock__factory {
    return super.connect(signer) as EventMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EventMockInterface {
    return new utils.Interface(_abi) as EventMockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): EventMock {
    return new Contract(address, _abi, signerOrProvider) as EventMock;
  }
}
