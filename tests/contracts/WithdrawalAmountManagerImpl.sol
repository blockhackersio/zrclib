// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract WithdrawalAmountManagerImpl {
    uint16 constant MAX_WITHDRAW_ACCOUNTS = 100;

    struct Balance {
        address account;
        uint256 amount;
    }

    uint256 w_cursor;
    uint256 d_cursor;

    mapping(uint256 => Balance) public deposits;

    function _getWithdrawalAmounts(
        uint256 _amount
    ) internal view returns (Balance[] memory, uint16) {
        uint256 _remaining = _amount;
        uint256 _start = w_cursor;
        uint256 _end = d_cursor;
        uint16 _index = 0;
        // This might be dodgy I kind of need a dynamic array ... can possibly encode to bytes using bitshifting but I can't be othered rn
        Balance[] memory _balances = new Balance[](MAX_WITHDRAW_ACCOUNTS);
        // Iterate over the accounts until we have paid the full amount or run out of accounts
        while (_remaining > 0 && (_start + _index) < _end) {
            require(_index < MAX_WITHDRAW_ACCOUNTS);
            // Copy storage to memory
            uint256 _mappingIndex = _index + _start;

            Balance memory balance = deposits[_mappingIndex];

            // If the current account has enough balance to pay the full
            // amount, deduct it and exit the loop
            if (balance.amount >= _remaining) {
                balance.amount = _remaining;
                _remaining = 0;
            }
            // Otherwise, deduct the balance from the amount and move
            // to the next account
            else {
                _remaining -= balance.amount;
            }
            _balances[_index] = balance;

            _index++;
        }
        require(_remaining == 0, "Insufficient balance in pool");
        return (_balances, _index + 1);
    }

    function _consumeDeposit(uint16 _index) internal {
        w_cursor += _index;
    }

    function _addDeposit(address _account, uint256 _amount) internal {
        deposits[d_cursor] = Balance({account: _account, amount: _amount});
        d_cursor++;
    }
}
