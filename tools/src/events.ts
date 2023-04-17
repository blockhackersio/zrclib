import { BigNumber, ethers } from "ethers";
import { Observable, from } from "rxjs";
import { EMPTY } from "rxjs";
import { filter, switchMap, catchError } from "rxjs/operators";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { ContractEvent, NewCommitment, NewNullifier } from "./types";

const abi = [
  "event NewCommitment(bytes32 indexed commitment, uint256 indexed index, bytes indexed encryptedOutput)",
  "event NewNullifier(bytes32 indexed nullifier)",
];

function ethEventToContractEvent(event: ethers.Event): ContractEvent {
  if (event.event === "NewCommitment") {
    const { commitment, index, encryptedOutput } = event.args as any as Omit<
      NewCommitment,
      "type"
    >;
    return {
      type: "NewCommitment",
      commitment,
      index,
      encryptedOutput,
    };
  }
  const { nullifier } = event.args as any as Omit<NewNullifier, "type">;
  return {
    type: "NewNullifier",
    nullifier,
  };
}

export function createEventStream(
  address: string,
  startingBlock: number = 0
): Observable<ContractEvent> {
  const provider = ethers.getDefaultProvider();
  const contract = new ethers.Contract(address, abi, provider);

  return new Observable<ContractEvent>((subscriber) => {
    const handleEvent = (event: ethers.Event) => {
      const contractEvent = ethEventToContractEvent(event);
      subscriber.next(contractEvent);
    };

    const combinedFilter = {
      topics: [
        [
          ethers.utils.id("NewCommitment(bytes32,uint256,bytes)"),
          ethers.utils.id("NewNullifier(bytes32)"),
        ],
      ],
      fromBlock: startingBlock,
    };

    contract.on(combinedFilter, handleEvent);

    return () => {
      contract.off(combinedFilter, handleEvent);
    };
  });
}

async function decryptCommitment(
  event: NewCommitment,
  keypair: Keypair
): Promise<Utxo> {
  return Utxo.decrypt(keypair, event.encryptedOutput, event.index);
}

function eventIsNewCommitment(event: ContractEvent): event is NewCommitment {
  return event.type === "NewCommitment";
}
function eventIsNullifier(event: ContractEvent): event is NewNullifier {
  return event.type === "NewNullifier";
}
export function filterValidEncryptedUtxosAndDecrypt(
  keypair: Keypair
): (a: Observable<ContractEvent>) => Observable<Utxo> {
  return (eventSource) =>
    eventSource.pipe(
      filter(eventIsNewCommitment),
      switchMap((event: NewCommitment) =>
        from(decryptCommitment(event, keypair)).pipe(catchError(() => EMPTY))
      )
    );
}

export const filterNullifiers =
  () => (eventSource: Observable<ContractEvent>) =>
    eventSource.pipe(filter(eventIsNullifier));
