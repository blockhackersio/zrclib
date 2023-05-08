// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ShieldedPool} from "@zrclib/sdk/contracts/ShieldedPool.sol";
import {DefiantPool} from "./DefiantPool.sol";
import {IERC20, ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "hardhat/console.sol";

contract DefiantDeposit {
    address immutable pool;
    address immutable token;
    enum State {
        IDLE,
        FULL,
        EMPTY
    }

    State state;

    constructor(address _pool, address _token) {
        token = _token;
        pool = _pool;
        state = State.IDLE;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Only pool can execute this function");
        _;
    }

    // Only the pool can control funds
    function transfer(address _to, uint256 _amount) external onlyPool {
        require(state == State.FULL, "State was not FULL");
        // console.log("DefiantDeposit.transfer() - _to", _to);
        // console.log("DefiantDeposit.transfer() - msg.sender", msg.sender);
        // console.log("DefiantDeposit.transfer() - address(this)", address(this));
        // Approve the pool to spend the deposit
        uint256 _balance = ERC20(token).balanceOf(address(this));
        if (_balance <= _amount) {
            state = State.EMPTY;
        }
        // console.log("token", token);
        IERC20(token).approve(
            pool,
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        );
        ERC20(token).transfer(_to, uint256(_amount));
    }

    function deposit(ShieldedPool.Proof calldata _proof) external {
        // console.log(
        //     "deposit()",
        //     uint256(_proof.extData.extAmount),
        //     "state = ",
        //     uint256(state)
        // );
        require(
            _proof.extData.extAmount > 0,
            "extAmount must indicate a deposit"
        );
        require(state == State.IDLE, "state was not IDLE");
        state = State.FULL;

        // Lock funds in this edge contract
        // Only the pool can withdraw funds
        IERC20(token).transferFrom(
            msg.sender,
            address(this),
            uint256(_proof.extData.extAmount)
        );

        // Forward proof to pool
        DefiantPool(pool).deposit(_proof);
    }
}
