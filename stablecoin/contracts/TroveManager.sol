// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract TroveManager {

    enum Status {
        nonExistent,
        active,
        closedByOwner,
        closedByLiquidation,
        closedByRedemption
    }

    // Store the necessary data for a trove
    struct Trove {
        uint debt;
        uint coll;
        uint stake;
        Status status;
        uint128 arrayIndex;
    }

    mapping (address => Trove) public Troves;

    function liquidate(address _borrower) external {
        _requireTroveIsActive(_borrower);

        // TODO: check if the trove is undercollateralized
        // TODO: transfer ETH in trove to stability pool and call liquidate function
        // TODO: transfer a liquidation premium to liquidator
    }

    function redeemCollateral(uint256 zusdAmount, uint256 collaterizationRatio) external {
        // TODO: get spot price
        // TODO: maintain the minimum collaterization ratio specified by users
    }

    function _requireTroveIsActive(address _borrower) internal view {
        require(Troves[_borrower].status == Status.active, "TroveManager: Trove does not exist or is closed");
    }
}