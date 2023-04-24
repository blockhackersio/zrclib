// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract DefiantWithdrawalProxy {
    // THIS MUST BE SET TO THE DEPLOYMENT ADDRESS OF DEFIANT_WITHDRAWAL IMPLEMENTATION
    address constant implementation =
        0x5FC8d32690cc91D4c39d9d3abcBD16989F875707;

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
