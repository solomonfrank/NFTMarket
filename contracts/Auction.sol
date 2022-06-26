// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFtMarket.sol";

import "hardhat/console.sol";

contract Auction is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private auctionId;

    struct Bidinfo {
        uint256 endAt;
        uint256 startDate;
        bool started;
        bool ended;
        address highestBidder;
        uint256 highestBid;
    }

    Bidinfo public auctionInfo;
    event Started();
    event Bid(address bidder, uint256 amount);
    event Withdraw(address bidder, uint256 amount);
    event End(address highestbidder, uint256);

    IERC721 public nft;

    address private highestBidder;
    uint256 private highestBid;
    address payable public seller;

    mapping(address => uint256) public bids;
    mapping(uint256 => uint256[]) public trackMarketAuction;
    mapping(uint256 => Bidinfo) public marketItemInfo;

    struct AuctionItem {
        uint256 auctionId;
        uint256 bid;
        address bidder;
        uint256 marketId;
    }

    mapping(address => uint256) public addressAuctionId;

    mapping(uint256 => AuctionItem) public autionItemsId;

    // constructor() {
    //     seller = payable(msg.sender);
    // }

    function startBid(
        address _nftContract,
        uint256 _tokenId,
        uint256 _startingBid,
        address nftMarket,
        uint256 marketId
    ) external {
        Bidinfo memory info = marketItemInfo[marketId];
        //  console.log(info);
        console.log("info", marketItemInfo[marketId].started);

        require(!info.started, "Bid already started");
        seller = payable(msg.sender);
        //  require(msg.sender == seller, "You not the seller");
        auctionId.increment();
        uint256 _auctionId = auctionId.current();
        console.log(_auctionId, msg.sender, marketId);
        autionItemsId[_auctionId] = AuctionItem(
            _auctionId,
            _startingBid,
            payable(msg.sender),
            marketId
        );
        // addressAuctionId[msg.sender] = _auctionId;
        highestBid = _startingBid;

        IERC721(_nftContract).transferFrom(nftMarket, address(this), _tokenId);

        marketItemInfo[marketId] = Bidinfo(
            block.timestamp + 30 minutes,
            block.timestamp,
            true,
            false,
            msg.sender,
            _startingBid
        );

        trackMarketAuction[marketId].push(_auctionId);
        emit Started();
    }

    function bid(uint256 marketId) external payable {
        Bidinfo memory info = marketItemInfo[marketId];
        require(info.started, "Bid not started");
        require(block.timestamp < info.endAt, "Bid has ended");
        require(msg.value > highestBid, "value is less than highesBid");

        if (addressAuctionId[msg.sender] > 0) {
            uint256 id = addressAuctionId[msg.sender];
            autionItemsId[id].bid += msg.value;
        } else {
            auctionId.increment();
            uint256 id = auctionId.current();
            autionItemsId[id] = AuctionItem(
                id,
                msg.value,
                msg.sender,
                marketId
            );
            addressAuctionId[msg.sender] = id;

            trackMarketAuction[marketId].push(id);
        }
        marketItemInfo[marketId].highestBidder = msg.sender;
        marketItemInfo[marketId].highestBid = msg.value;
        // highestBidder = msg.sender;
        // highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external payable nonReentrant {
        uint256 id = addressAuctionId[msg.sender];
        uint256 balance = autionItemsId[id].bid;
        autionItemsId[id].bid = 0;
        payable(autionItemsId[id].bidder).transfer(balance);

        // uint256 balance = bids[msg.sender];
        // bids[msg.sender] = 0;
        payable(msg.sender).transfer(balance);

        emit Withdraw(msg.sender, balance);
    }

    function end(
        address _nftContract,
        uint256 _tokenId,
        uint256 marketId,
        address marketNftAddress
    ) external {
        require(!marketItemInfo[marketId].ended, "Not sended");
        require(
            block.timestamp < marketItemInfo[marketId].endAt,
            "Bid expired"
        );
        // ended = true;
        console.log("marketId", marketId);
        // MarketItem storage m = idToMarketItem[marketId];
        marketItemInfo[marketId].ended = true;
        console.log(
            "marketItemInfo[marketId].highestBidder",
            marketItemInfo[marketId].highestBidder
        );
        if (marketItemInfo[marketId].highestBidder != address(0)) {
            IERC721(_nftContract).safeTransferFrom(
                address(this),
                marketItemInfo[marketId].highestBidder,
                _tokenId
            );
            payable(seller).transfer(marketItemInfo[marketId].highestBid);
            NftMarket(marketNftAddress).updateOwner(
                marketId,
                marketItemInfo[marketId].highestBidder
            );

            // console.log("mamarhshshrketId", m.itemId);
        } else {
            IERC721(_nftContract).safeTransferFrom(
                address(this),
                seller,
                _tokenId
            );
        }
        emit End(seller, marketItemInfo[marketId].highestBid);
    }

    function fetchBidder(uint256 marketId)
        external
        view
        returns (AuctionItem[] memory)
    {
        uint256 currentIdx = 0;
        uint256 len = trackMarketAuction[marketId].length;
        console.log("length", len);
        AuctionItem[] memory items = new AuctionItem[](len);
        for (uint256 i = 0; i < len; i++) {
            uint256 id = trackMarketAuction[marketId][i];
            AuctionItem storage currentItem = autionItemsId[id];

            if (currentItem.marketId == marketId) {
                console.log("Enter", currentItem.marketId);
                items[currentIdx] = currentItem;
            }

            currentIdx += 1;
        }
        return items;
    }

    function getBidInfo(uint256 id) external view returns (Bidinfo memory) {
        return marketItemInfo[id];
    }
}
