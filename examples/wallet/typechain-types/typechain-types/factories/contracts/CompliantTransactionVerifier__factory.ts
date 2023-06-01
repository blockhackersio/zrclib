/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  CompliantTransactionVerifier,
  CompliantTransactionVerifierInterface,
} from "../../contracts/CompliantTransactionVerifier";

const _abi = [
  {
    inputs: [
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
      {
        internalType: "uint256[9]",
        name: "input",
        type: "uint256[9]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "r",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061149d806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063c542c93b14610030575b600080fd5b61004361003e3660046112e5565b610057565b604051901515815260200160405180910390f35b60006100616110f8565b60408051808201825287518152602080890151818301529083528151608081018352875151818401908152885183015160608301528152825180840184528883018051518252518301518184015281830152838201528151808301835286518152868201518183015283830152815160098082526101408201909352600092909182016101208036833701905050905060005b60098110156101435784816009811061010f5761010f6113c3565b6020020151828281518110610126576101266113c3565b60209081029190910101528061013b816113ef565b9150506100f4565b5061014e818361016f565b60000361016057600192505050610167565b6000925050505b949350505050565b60007f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018161019b610366565b9050806080015151855160016101b19190611408565b146101f85760405162461bcd60e51b81526020600482015260126024820152711d995c9a599a595c8b5898590b5a5b9c1d5d60721b60448201526064015b60405180910390fd5b604080518082019091526000808252602082018190525b86518110156102e9578387828151811061022b5761022b6113c3565b6020026020010151106102805760405162461bcd60e51b815260206004820152601f60248201527f76657269666965722d6774652d736e61726b2d7363616c61722d6669656c640060448201526064016101ef565b6102d5826102d085608001518460016102999190611408565b815181106102a9576102a96113c3565b60200260200101518a85815181106102c3576102c36113c3565b6020026020010151610a47565b610add565b9150806102e1816113ef565b91505061020f565b50610312818360800151600081518110610305576103056113c3565b6020026020010151610add565b90506103486103248660000151610b76565b8660200151846000015185602001518587604001518b604001518960600151610c15565b6103585760019350505050610360565b600093505050505b92915050565b61036e611149565b6040805180820182527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e281527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19266020808301919091529083528151608080820184527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c8285019081527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab606080850191909152908352845180860186527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a781527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec8818601528385015285840192909252835180820185527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c28186018181527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed838601819052908352865180880188527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b8082527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa82890181905285890192909252898901949094528751948501885284880192835284860191909152908352855180870187529182528185015281840152908401528151600a8082526101608201909352919082015b604080518082019091526000808252602082015281526020019060019003908161057757505060808201908152604080518082019091527f0bfac1eb146de438fd61a21c21e85588dbe4242599f60f9e4c8bec73cce7133581527f197acad80454d85546aaa27e0d99aad01dda93cf72d4e622f3176429e971ae3360208201529051805160009061060a5761060a6113c3565b602002602001018190525060405180604001604052807f2858711096075a87b5bbfee2a9bcbc1de21553ed34c83eeeab35d7ff160e19ac81526020017f27c0f03edcbe96d6484dbf34d1312defff977429da4916319bc06d141e56aa668152508160800151600181518110610681576106816113c3565b602002602001018190525060405180604001604052807f122273b3badf922e9a34187c614a093ec963efe295c8ae9234e0ecb551aaad1b81526020017f2f439f0163d7b8c1043f59f6ead16e7791461ec3935225d8640ca4588c79267e81525081608001516002815181106106f8576106f86113c3565b602002602001018190525060405180604001604052807f1fac00de98da592b8e9c46c3abf2de8d99501b2ad09ccc934ec2ba168dbd9b7c81526020017f2450837c462ef0458b14b31f89f0911ebe66bae7cfc065377118d9b0bf94bb10815250816080015160038151811061076f5761076f6113c3565b602002602001018190525060405180604001604052807f2c7cbb42ad802361cf6727708b6f09c1c0df4d4e9895049afdf9df35982728ff81526020017f16c01207997ce39d9e42d6af6acba25f4aa90a4e404e545f41dfc1e21095df0e81525081608001516004815181106107e6576107e66113c3565b602002602001018190525060405180604001604052807f0d64c3c7c164ccfc8cd65b9bd2f77f616b58d86f167fc6c46d6f6000cc5d438a81526020017f09511bd6a6412a3b6155213dbd8d7ed8a43953b27d5a7de770c36b18d35e08cb815250816080015160058151811061085d5761085d6113c3565b602002602001018190525060405180604001604052807f2ea2e85d51b521cbe05cc029625618d45a8b1cea1475fa68a9a50fce95119a3481526020017f1fd9a624949f2f8586e11f0b06443f58da781bbafb5dd6c7c7a15f1bbcc5713a81525081608001516006815181106108d4576108d46113c3565b602002602001018190525060405180604001604052807f05cde3847907c9f8a80158a63fb0d747e5690d66e4296f00205eb25fd3b031e181526020017f0d2c88cc2f716dd21d80123692ed1b63fd3224c3caafda8a8333ae685e594226815250816080015160078151811061094b5761094b6113c3565b602002602001018190525060405180604001604052807f1b85767148ff0982b2e8a319a07234a1cdcaf700a572e7df112d5234c19f2f6881526020017f17bdf045a3162d2630b82d6bcfbbd36a85ad895db9310d455cb26eec1a6e824381525081608001516008815181106109c2576109c26113c3565b602002602001018190525060405180604001604052807f022ee949d165243b942d9e7b3caf9f87bc9b347cfd449f877dbcc9d7fe27364181526020017f28256189a3e1d30ab39d799e5840f6a6e6f30df1d492e1b52dcde15a2ad75d188152508160800151600981518110610a3957610a396113c3565b602002602001018190525090565b6040805180820190915260008082526020820152610a6361119a565b835181526020808501519082015260408101839052600060608360808460076107d05a03fa90508080610a9257fe5b5080610ad55760405162461bcd60e51b81526020600482015260126024820152711c185a5c9a5b99cb5b5d5b0b59985a5b195960721b60448201526064016101ef565b505092915050565b6040805180820190915260008082526020820152610af96111b8565b8351815260208085015181830152835160408301528301516060808301919091526000908360c08460066107d05a03fa90508080610b3357fe5b5080610ad55760405162461bcd60e51b81526020600482015260126024820152711c185a5c9a5b99cb5859190b59985a5b195960721b60448201526064016101ef565b604080518082019091526000808252602082015281517f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4790158015610bbd57506020830151155b15610bdd5750506040805180820190915260008082526020820152919050565b604051806040016040528084600001518152602001828560200151610c02919061141b565b610c0c908461143d565b90529392505050565b60408051600480825260a08201909252600091829190816020015b6040805180820190915260008082526020820152815260200190600190039081610c3057505060408051600480825260a0820190925291925060009190602082015b610c7a6111d6565b815260200190600190039081610c725790505090508a82600081518110610ca357610ca36113c3565b60200260200101819052508882600181518110610cc257610cc26113c3565b60200260200101819052508682600281518110610ce157610ce16113c3565b60200260200101819052508482600381518110610d0057610d006113c3565b60200260200101819052508981600081518110610d1f57610d1f6113c3565b60200260200101819052508781600181518110610d3e57610d3e6113c3565b60200260200101819052508581600281518110610d5d57610d5d6113c3565b60200260200101819052508381600381518110610d7c57610d7c6113c3565b6020026020010181905250610d918282610da0565b9b9a5050505050505050505050565b60008151835114610dec5760405162461bcd60e51b81526020600482015260166024820152751c185a5c9a5b99cb5b195b99dd1a1ccb59985a5b195960521b60448201526064016101ef565b82516000610dfb826006611450565b905060008167ffffffffffffffff811115610e1857610e18611232565b604051908082528060200260200182016040528015610e41578160200160208202803683370190505b50905060005b8381101561107c57868181518110610e6157610e616113c3565b60200260200101516000015182826006610e7b9190611450565b610e86906000611408565b81518110610e9657610e966113c3565b602002602001018181525050868181518110610eb457610eb46113c3565b60200260200101516020015182826006610ece9190611450565b610ed9906001611408565b81518110610ee957610ee96113c3565b602002602001018181525050858181518110610f0757610f076113c3565b6020908102919091010151515182610f20836006611450565b610f2b906002611408565b81518110610f3b57610f3b6113c3565b602002602001018181525050858181518110610f5957610f596113c3565b60209081029190910181015151015182610f74836006611450565b610f7f906003611408565b81518110610f8f57610f8f6113c3565b602002602001018181525050858181518110610fad57610fad6113c3565b602002602001015160200151600060028110610fcb57610fcb6113c3565b602002015182610fdc836006611450565b610fe7906004611408565b81518110610ff757610ff76113c3565b602002602001018181525050858181518110611015576110156113c3565b602002602001015160200151600160028110611033576110336113c3565b602002015182611044836006611450565b61104f906005611408565b8151811061105f5761105f6113c3565b602090810291909101015280611074816113ef565b915050610e47565b506110856111f6565b6000602082602086026020860160086107d05a03fa905080806110a457fe5b50806110ea5760405162461bcd60e51b81526020600482015260156024820152741c185a5c9a5b99cb5bdc18dbd9194b59985a5b1959605a1b60448201526064016101ef565b505115159695505050505050565b6040805160a0810190915260006060820181815260808301919091528152602081016111226111d6565b8152602001611144604051806040016040528060008152602001600081525090565b905290565b6040805160e08101909152600060a0820181815260c08301919091528152602081016111736111d6565b81526020016111806111d6565b815260200161118d6111d6565b8152602001606081525090565b60405180606001604052806003906020820280368337509192915050565b60405180608001604052806004906020820280368337509192915050565b60405180604001604052806111e9611214565b8152602001611144611214565b60405180602001604052806001906020820280368337509192915050565b60405180604001604052806002906020820280368337509192915050565b634e487b7160e01b600052604160045260246000fd5b6040805190810167ffffffffffffffff8111828210171561126b5761126b611232565b60405290565b604051610120810167ffffffffffffffff8111828210171561126b5761126b611232565b600082601f8301126112a657600080fd5b6112ae611248565b8060408401858111156112c057600080fd5b845b818110156112da5780358452602093840193016112c2565b509095945050505050565b6000806000806102208086880312156112fd57600080fd5b6113078787611295565b9450604087605f88011261131a57600080fd5b611322611248565b8060c089018a81111561133457600080fd5b838a015b818110156113595761134a8c82611295565b84526020909301928401611338565b508197506113678b82611295565b9650505050508661011f87011261137d57600080fd5b611385611271565b90860190808883111561139757600080fd5b61010088015b838110156113b557803583526020928301920161139d565b509598949750929550505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611401576114016113d9565b5060010190565b80820180821115610360576103606113d9565b60008261143857634e487b7160e01b600052601260045260246000fd5b500690565b81810381811115610360576103606113d9565b8082028115828204841417610360576103606113d956fea264697066735822122057b47cf9ee2c2e4d58f955c4ecd8975a2b1cbf7f498a21bb632801626e294ef064736f6c63430008120033";

type CompliantTransactionVerifierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CompliantTransactionVerifierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CompliantTransactionVerifier__factory extends ContractFactory {
  constructor(...args: CompliantTransactionVerifierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CompliantTransactionVerifier> {
    return super.deploy(
      overrides || {}
    ) as Promise<CompliantTransactionVerifier>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CompliantTransactionVerifier {
    return super.attach(address) as CompliantTransactionVerifier;
  }
  override connect(signer: Signer): CompliantTransactionVerifier__factory {
    return super.connect(signer) as CompliantTransactionVerifier__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CompliantTransactionVerifierInterface {
    return new utils.Interface(_abi) as CompliantTransactionVerifierInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CompliantTransactionVerifier {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CompliantTransactionVerifier;
  }
}