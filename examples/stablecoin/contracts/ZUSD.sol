// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@zrclib/sdk/contracts/ShieldedPool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZUSD is ShieldedPool, ERC20 {
    address public immutable troveManagerAddress;
    address public immutable stabilityPoolAddress;

    constructor(
        address _hasherAddress,
        address _verifierAddress,
        address _troveManagerAddress,
        address _stabilityPoolAddress,
        address _swapExecutorAddress
    ) ShieldedPool(5, _hasherAddress, _verifierAddress, _swapExecutorAddress) ERC20("ZUSD", "ZUSD") {
        troveManagerAddress = _troveManagerAddress;
        stabilityPoolAddress = _stabilityPoolAddress;
    }

    function mint(address _account, uint256 _amount) external {
        _requireCallerIsTroveManager();
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external {
        _requireCallerIsStabilityPool();
        _burn(_account, _amount);
    }

    /**
     * @notice Interface for ZUSD to and from the shielded pool
     * If deposit, subsequent transfer will be private in the shielded pool
     * If withdraw, subsequent transfer will be normal ERC20 token transfer
     */
    function transact(Proof calldata _proof) public override {
        // Deposit functionality
        if (_proof.extData.extAmount > 0) {
            _transfer(
                msg.sender,
                address(this),
                uint256(_proof.extData.extAmount)
            );
        }

        // Proof determines whether we add to or remove from pool
        _transact(_proof);

        // Withdrawal functionality
        if (_proof.extData.extAmount < 0) {
            require(
                _proof.extData.recipient != address(0),
                "Can't withdraw to zero address"
            );

            _transfer(
                address(this),
                _proof.extData.recipient,
                uint256(_proof.extData.extAmount)
            );
        }
    }

    function _requireCallerIsTroveManager() internal view {
        require(
            msg.sender == troveManagerAddress,
            "LUSDToken: Caller is not TroveManager"
        );
    }

    function _requireCallerIsStabilityPool() internal view {
        require(
            msg.sender == stabilityPoolAddress,
            "LUSDToken: Caller is not StabilityPool"
        );
    }
}
