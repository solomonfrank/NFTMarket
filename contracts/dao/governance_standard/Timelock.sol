// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract Timelock is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposals,
        address[] memory executers
    ) TimelockController(minDelay, proposals, executers) {}
}
