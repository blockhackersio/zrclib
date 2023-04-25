// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {WithdrawalAmountManagerImpl} from "./WithdrawalAmountManagerImpl.sol";

contract WithdrawalAmountManagerTester is WithdrawalAmountManagerImpl {
    function getWithdrawalAmounts(
        uint256 _amount
    ) public view returns (Balance[] memory, uint16) {
        return _getWithdrawalAmounts(_amount);
    }

    function consumeDeposit(uint16 _index) public {
        _consumeDeposit(_index);
    }

    function addDeposit(address _account, uint256 _amount) public {
        _addDeposit(_account, _amount);
    }
}
