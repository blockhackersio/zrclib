/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export declare namespace AbstractShieldedPool {
  export type ProofArgumentsStruct = {
    proof: PromiseOrValue<BytesLike>;
    root: PromiseOrValue<BytesLike>;
    inputNullifiers: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>];
    outputCommitments: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>];
    publicAmount: PromiseOrValue<BigNumberish>;
    publicAsset: PromiseOrValue<string>;
    extDataHash: PromiseOrValue<BytesLike>;
  };

  export type ProofArgumentsStructOutput = [
    string,
    string,
    [string, string],
    [string, string],
    BigNumber,
    string,
    string
  ] & {
    proof: string;
    root: string;
    inputNullifiers: [string, string];
    outputCommitments: [string, string];
    publicAmount: BigNumber;
    publicAsset: string;
    extDataHash: string;
  };

  export type ExtDataStruct = {
    recipient: PromiseOrValue<string>;
    extAmount: PromiseOrValue<BigNumberish>;
    encryptedOutput1: PromiseOrValue<BytesLike>;
    encryptedOutput2: PromiseOrValue<BytesLike>;
    tokenOut: PromiseOrValue<string>;
    amountOutMin: PromiseOrValue<BigNumberish>;
    swapRecipient: PromiseOrValue<string>;
    swapRouter: PromiseOrValue<string>;
    swapData: PromiseOrValue<BytesLike>;
    transactData: PromiseOrValue<BytesLike>;
  };

  export type ExtDataStructOutput = [
    string,
    BigNumber,
    string,
    string,
    string,
    BigNumber,
    string,
    string,
    string,
    string
  ] & {
    recipient: string;
    extAmount: BigNumber;
    encryptedOutput1: string;
    encryptedOutput2: string;
    tokenOut: string;
    amountOutMin: BigNumber;
    swapRecipient: string;
    swapRouter: string;
    swapData: string;
    transactData: string;
  };

  export type ProofStruct = {
    proofArguments: AbstractShieldedPool.ProofArgumentsStruct;
    extData: AbstractShieldedPool.ExtDataStruct;
  };

  export type ProofStructOutput = [
    AbstractShieldedPool.ProofArgumentsStructOutput,
    AbstractShieldedPool.ExtDataStructOutput
  ] & {
    proofArguments: AbstractShieldedPool.ProofArgumentsStructOutput;
    extData: AbstractShieldedPool.ExtDataStructOutput;
  };
}

export interface AbstractShieldedPoolInterface extends utils.Interface {
  functions: {
    "FIELD_SIZE()": FunctionFragment;
    "MAX_EXT_AMOUNT()": FunctionFragment;
    "ROOT_HISTORY_SIZE()": FunctionFragment;
    "ZERO_VALUE()": FunctionFragment;
    "currentRootIndex()": FunctionFragment;
    "filledSubtrees(uint256)": FunctionFragment;
    "getLastRoot()": FunctionFragment;
    "hashLeftRight(bytes32,bytes32)": FunctionFragment;
    "hasher()": FunctionFragment;
    "isKnownRoot(bytes32)": FunctionFragment;
    "isSpent(bytes32)": FunctionFragment;
    "levels()": FunctionFragment;
    "nextIndex()": FunctionFragment;
    "nullifierHashes(bytes32)": FunctionFragment;
    "parseProof(bytes)": FunctionFragment;
    "roots(uint256)": FunctionFragment;
    "swapExecutor()": FunctionFragment;
    "transact(((bytes,bytes32,bytes32[2],bytes32[2],uint256,address,bytes32),(address,int256,bytes,bytes,address,uint256,address,address,bytes,bytes)))": FunctionFragment;
    "transactAndSwap(((bytes,bytes32,bytes32[2],bytes32[2],uint256,address,bytes32),(address,int256,bytes,bytes,address,uint256,address,address,bytes,bytes)))": FunctionFragment;
    "zeros(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "FIELD_SIZE"
      | "MAX_EXT_AMOUNT"
      | "ROOT_HISTORY_SIZE"
      | "ZERO_VALUE"
      | "currentRootIndex"
      | "filledSubtrees"
      | "getLastRoot"
      | "hashLeftRight"
      | "hasher"
      | "isKnownRoot"
      | "isSpent"
      | "levels"
      | "nextIndex"
      | "nullifierHashes"
      | "parseProof"
      | "roots"
      | "swapExecutor"
      | "transact"
      | "transactAndSwap"
      | "zeros"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "FIELD_SIZE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MAX_EXT_AMOUNT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ROOT_HISTORY_SIZE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ZERO_VALUE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "currentRootIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "filledSubtrees",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getLastRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "hashLeftRight",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "hasher", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isKnownRoot",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isSpent",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "levels", values?: undefined): string;
  encodeFunctionData(functionFragment: "nextIndex", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nullifierHashes",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "parseProof",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "roots",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "swapExecutor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transact",
    values: [AbstractShieldedPool.ProofStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "transactAndSwap",
    values: [AbstractShieldedPool.ProofStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "zeros",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "FIELD_SIZE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "MAX_EXT_AMOUNT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ROOT_HISTORY_SIZE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ZERO_VALUE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "currentRootIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "filledSubtrees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "hashLeftRight",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hasher", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isKnownRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isSpent", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "levels", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nextIndex", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nullifierHashes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "parseProof", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "roots", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "swapExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transact", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transactAndSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "zeros", data: BytesLike): Result;

  events: {
    "NewCommitment(bytes32,uint256,bytes)": EventFragment;
    "NewNullifier(bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewCommitment"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewNullifier"): EventFragment;
}

export interface NewCommitmentEventObject {
  commitment: string;
  index: BigNumber;
  encryptedOutput: string;
}
export type NewCommitmentEvent = TypedEvent<
  [string, BigNumber, string],
  NewCommitmentEventObject
>;

export type NewCommitmentEventFilter = TypedEventFilter<NewCommitmentEvent>;

export interface NewNullifierEventObject {
  nullifier: string;
}
export type NewNullifierEvent = TypedEvent<[string], NewNullifierEventObject>;

export type NewNullifierEventFilter = TypedEventFilter<NewNullifierEvent>;

export interface AbstractShieldedPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AbstractShieldedPoolInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    FIELD_SIZE(overrides?: CallOverrides): Promise<[BigNumber]>;

    MAX_EXT_AMOUNT(overrides?: CallOverrides): Promise<[BigNumber]>;

    ROOT_HISTORY_SIZE(overrides?: CallOverrides): Promise<[number]>;

    ZERO_VALUE(overrides?: CallOverrides): Promise<[BigNumber]>;

    currentRootIndex(overrides?: CallOverrides): Promise<[number]>;

    filledSubtrees(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getLastRoot(overrides?: CallOverrides): Promise<[string]>;

    hashLeftRight(
      _left: PromiseOrValue<BytesLike>,
      _right: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    hasher(overrides?: CallOverrides): Promise<[string]>;

    isKnownRoot(
      _root: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isSpent(
      _nullifierHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    levels(overrides?: CallOverrides): Promise<[number]>;

    nextIndex(overrides?: CallOverrides): Promise<[number]>;

    nullifierHashes(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    parseProof(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        [BigNumber, BigNumber],
        [[BigNumber, BigNumber], [BigNumber, BigNumber]],
        [BigNumber, BigNumber]
      ] & {
        a: [BigNumber, BigNumber];
        b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
        c: [BigNumber, BigNumber];
      }
    >;

    roots(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    swapExecutor(overrides?: CallOverrides): Promise<[string]>;

    transact(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transactAndSwap(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    zeros(
      i: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  FIELD_SIZE(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_EXT_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

  ROOT_HISTORY_SIZE(overrides?: CallOverrides): Promise<number>;

  ZERO_VALUE(overrides?: CallOverrides): Promise<BigNumber>;

  currentRootIndex(overrides?: CallOverrides): Promise<number>;

  filledSubtrees(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getLastRoot(overrides?: CallOverrides): Promise<string>;

  hashLeftRight(
    _left: PromiseOrValue<BytesLike>,
    _right: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  hasher(overrides?: CallOverrides): Promise<string>;

  isKnownRoot(
    _root: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isSpent(
    _nullifierHash: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  levels(overrides?: CallOverrides): Promise<number>;

  nextIndex(overrides?: CallOverrides): Promise<number>;

  nullifierHashes(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  parseProof(
    data: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      [BigNumber, BigNumber],
      [[BigNumber, BigNumber], [BigNumber, BigNumber]],
      [BigNumber, BigNumber]
    ] & {
      a: [BigNumber, BigNumber];
      b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
      c: [BigNumber, BigNumber];
    }
  >;

  roots(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  swapExecutor(overrides?: CallOverrides): Promise<string>;

  transact(
    _proof: AbstractShieldedPool.ProofStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transactAndSwap(
    _proof: AbstractShieldedPool.ProofStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  zeros(
    i: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    FIELD_SIZE(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_EXT_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

    ROOT_HISTORY_SIZE(overrides?: CallOverrides): Promise<number>;

    ZERO_VALUE(overrides?: CallOverrides): Promise<BigNumber>;

    currentRootIndex(overrides?: CallOverrides): Promise<number>;

    filledSubtrees(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getLastRoot(overrides?: CallOverrides): Promise<string>;

    hashLeftRight(
      _left: PromiseOrValue<BytesLike>,
      _right: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    hasher(overrides?: CallOverrides): Promise<string>;

    isKnownRoot(
      _root: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isSpent(
      _nullifierHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    levels(overrides?: CallOverrides): Promise<number>;

    nextIndex(overrides?: CallOverrides): Promise<number>;

    nullifierHashes(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    parseProof(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        [BigNumber, BigNumber],
        [[BigNumber, BigNumber], [BigNumber, BigNumber]],
        [BigNumber, BigNumber]
      ] & {
        a: [BigNumber, BigNumber];
        b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
        c: [BigNumber, BigNumber];
      }
    >;

    roots(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    swapExecutor(overrides?: CallOverrides): Promise<string>;

    transact(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    transactAndSwap(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    zeros(
      i: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "NewCommitment(bytes32,uint256,bytes)"(
      commitment?: PromiseOrValue<BytesLike> | null,
      index?: PromiseOrValue<BigNumberish> | null,
      encryptedOutput?: null
    ): NewCommitmentEventFilter;
    NewCommitment(
      commitment?: PromiseOrValue<BytesLike> | null,
      index?: PromiseOrValue<BigNumberish> | null,
      encryptedOutput?: null
    ): NewCommitmentEventFilter;

    "NewNullifier(bytes32)"(
      nullifier?: PromiseOrValue<BytesLike> | null
    ): NewNullifierEventFilter;
    NewNullifier(
      nullifier?: PromiseOrValue<BytesLike> | null
    ): NewNullifierEventFilter;
  };

  estimateGas: {
    FIELD_SIZE(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_EXT_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

    ROOT_HISTORY_SIZE(overrides?: CallOverrides): Promise<BigNumber>;

    ZERO_VALUE(overrides?: CallOverrides): Promise<BigNumber>;

    currentRootIndex(overrides?: CallOverrides): Promise<BigNumber>;

    filledSubtrees(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLastRoot(overrides?: CallOverrides): Promise<BigNumber>;

    hashLeftRight(
      _left: PromiseOrValue<BytesLike>,
      _right: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    hasher(overrides?: CallOverrides): Promise<BigNumber>;

    isKnownRoot(
      _root: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isSpent(
      _nullifierHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    levels(overrides?: CallOverrides): Promise<BigNumber>;

    nextIndex(overrides?: CallOverrides): Promise<BigNumber>;

    nullifierHashes(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    parseProof(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    roots(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    swapExecutor(overrides?: CallOverrides): Promise<BigNumber>;

    transact(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transactAndSwap(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    zeros(
      i: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    FIELD_SIZE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_EXT_AMOUNT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ROOT_HISTORY_SIZE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ZERO_VALUE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    currentRootIndex(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    filledSubtrees(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLastRoot(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    hashLeftRight(
      _left: PromiseOrValue<BytesLike>,
      _right: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    hasher(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isKnownRoot(
      _root: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isSpent(
      _nullifierHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    levels(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nextIndex(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nullifierHashes(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    parseProof(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    roots(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swapExecutor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transact(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transactAndSwap(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    zeros(
      i: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
