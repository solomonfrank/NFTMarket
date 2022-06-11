// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    uint256 private value;

    event ValueChanged(uint256 newValue);

    function store(uint256 newValue) public onlyOwner {
        value = newValue;

        emit ValueChanged(newValue);
    }

    function retreve() public view returns (uint256) {
        return value;
    }
}
