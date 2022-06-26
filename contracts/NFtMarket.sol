// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";
import "./Auction.sol";

contract NftMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemId;
    Counters.Counter private _itemsSold;

    address payable owner;
    address auditOwner;
    uint256 private listingPrice = 0.01 ether;

    // item to  create model
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable onwer;
        address payable seller;
        uint256 price;
        bool sold;
    }

    // mapping createdId   to  martketItem
    mapping(uint256 => MarketItem) public idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address nftContract,
        uint256 indexed tokenId,
        address onwer,
        address seller,
        uint256 price,
        bool sold
    );

    constructor(address _auditAddress) {
        owner = payable(msg.sender);
        auditOwner = _auditAddress;
    }

    function createMarketItem(
        address nftAddress,
        uint256 _price,
        uint256 _tokenId
    ) public payable nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        require(
            msg.value >= listingPrice,
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
        // transfer ownership to the market place contract
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

    function getMarketItemDetail(uint256 itemId)
        public
        view
        returns (MarketItem memory)
    {
        return idToMarketItem[itemId];
    }

    function createmarketSale(uint256 itemId, address nftContract)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price; //get market item price
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Amount is less than the asking price");
        idToMarketItem[itemId].seller.transfer(msg.value); // transfer the sale amount to the seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); // transfer nft ownership to from the market place contract to the buyer
        idToMarketItem[itemId].onwer = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment(); // increment sold  count
        payable(owner).transfer(listingPrice); // Transfer listing price to the market place owner
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
        console.log("sender", msg.sender, totalItemCount);
        uint256 itemCount;
        uint256 currentIdx = 0;

        for (uint256 i = 0; i < totalItemCount; ) {
            if (idToMarketItem[i + 1].onwer == msg.sender) {
                itemCount += 1;
            }
            unchecked {
                i++;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; ) {
            if (idToMarketItem[i + 1].onwer == msg.sender) {
                //  uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem memory currentItem = idToMarketItem[i + 1];
                items[currentIdx] = currentItem;
                currentIdx += 1;
            }

            unchecked {
                i++;
            }
        }

        return items;
    }

    function fetchitemcreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();

        uint256 itemCount;
        uint256 currentIdx = 0;

        for (uint256 i = 0; i < totalItemCount; ) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
            unchecked {
                i++;
            }
        }
        console.log("fetchitemcreated", totalItemCount, itemCount, msg.sender);
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; ) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                // uint256 currentId = idToMarketItem[i + 1]
                MarketItem memory currentItem = idToMarketItem[i + 1];
                items[currentIdx] = currentItem;
                currentIdx += 1;
            }

            unchecked {
                i++;
            }
        }

        return items;
    }

    function approveAuction(address nftContract, address auctionAddress)
        public
    {
        IERC721(nftContract).setApprovalForAll(auctionAddress, true);
    }

    function updateOwner(uint256 marketId, address bidder) external {
        require(auditOwner == msg.sender, "Not allowed");
        MarketItem storage m = idToMarketItem[marketId];
        console.log(m.itemId, marketId);
        m.onwer = payable(bidder);
        m.sold = true;
    }
}
