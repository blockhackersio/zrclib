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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

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

export interface DefiantWithdrawalInterface extends utils.Interface {
  functions: {
    "withdraw(((bytes,bytes32,bytes32[2],bytes32[2],uint256,address,bytes32),(address,int256,bytes,bytes,address,uint256,address,address,bytes,bytes)))": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "withdraw"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "withdraw",
    values: [AbstractShieldedPool.ProofStruct]
  ): string;

  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface DefiantWithdrawal extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DefiantWithdrawalInterface;

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
    withdraw(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  withdraw(
    _proof: AbstractShieldedPool.ProofStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    withdraw(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    withdraw(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    withdraw(
      _proof: AbstractShieldedPool.ProofStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
