import { ethers } from "hardhat";
import { AbiCoder } from "ethers/lib/utils";
import { 
    BlocklistVerifier__factory,
    CompliantShieldedPool__factory
} from "../typechain-types";

// async function setup() {
//     // Prepare signers
//     const [deployer] = await ethers.getSigners();

//     // Deploy the Verifier
//     const verifierFactory = new BlocklistVerifier__factory(deployer);
//     const verifier = await verifierFactory.deploy();

//     // Deploy the shielded pool passing in the verifier
//     const shieldedPoolFactory = new CompliantShieldedPool__factory(deployer);
//     const contract = await shieldedPoolFactory.deploy(
//       verifier.address,
//     );
  
//     return { contract };
// }