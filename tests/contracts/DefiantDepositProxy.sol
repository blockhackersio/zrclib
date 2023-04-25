// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract DefiantDepositProxy {
    // TODO: THIS MUST BE SET TO THE DEPLOYMENT ADDRESS OF DEFIANT_DEPOSIT IMPLEMENTATION
    address constant implementation =
        0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9;

    fallback() external {
        assembly {
            calldatacopy(0x0, 0x0, calldatasize())
            let result := delegatecall(
                gas(),
                implementation,
                0x0,
                calldatasize(),
                0x0,
                0x0
            )
            returndatacopy(0x0, 0x0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
