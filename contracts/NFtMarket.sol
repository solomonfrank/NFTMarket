// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemId;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 private listingPrice = 0.01 ether;

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable onwer;
        address payable seller;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address nftContract,
        uint256 indexed tokenId,
        address onwer,
        address seller,
        uint256 price,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function createMarketItem(
        address nftAddress,
        uint256 _price,
        uint256 _tokenId
    ) public payable nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        require(
            msg.value == listingPrice,
            "Amount must be equal to the listing rice"
        );
        _itemId.increment();

        uint256 itemId = _itemId.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftAddress,
            _tokenId,
            payable(address(0)),
            payable(msg.sender),
            _price,
            false
        );
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _tokenId);
        emit MarketItemCreated(
            itemId,
            nftAddress,
            _tokenId,
            address(0),
            msg.sender,
            _price,
            false
        );
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createmarketSale(uint256 itemId, address nftContract)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Amount is less than the asking price");
        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].onwer = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    function fetchMarketItem() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemId.current();
        uint256 unSoldItem = itemCount - _itemsSold.current();
        uint256 currentIdx = 0;
        MarketItem[] memory items = new MarketItem[](unSoldItem);

        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = idToMarketItem[i + 1].itemId;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIdx] = currentItem;
            currentIdx += 1;
        }
        return items;
    }

    function fetchMyNFT() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();
        uint256 itemCount;
        uint256 currentIdx = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].onwer == msg.sender) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].onwer == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIdx] = currentItem;
                currentIdx += 1;
            }
        }

        return items;
    }

    function fetchitemcreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();
        uint256 itemCount;
        uint256 currentIdx = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIdx] = currentItem;
                currentIdx += 1;
            }
        }

        return items;
    }
}
