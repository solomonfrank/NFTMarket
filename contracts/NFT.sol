// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenId;
    address public contractAddress;
    address public auctionAddress;

    constructor(address _marketplaceAddress, address _auctionAddress)
        ERC721("My market place", "MKP")
    {
        contractAddress = _marketplaceAddress;
        auctionAddress = _auctionAddress;
        setApprovalForAll(auctionAddress, true);
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenId.increment();
        uint256 newTokenId = _tokenId.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        setApprovalForAll(contractAddress, true);

        setApprovalForAll(auctionAddress, true);
        console.log("auction", auctionAddress, contractAddress);
        return newTokenId;
    }

    function registerAuction(uint256 id) external {
        transferFrom(contractAddress, auctionAddress, id);
    }
}
