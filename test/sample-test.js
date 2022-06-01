const { expect } = require("chai");

describe("NFTMarket", function () {
  it("Should create and execute market sale", async function () {
    const MarketContract = await ethers.getContractFactory("NftMarket");
    const marketInstance = await MarketContract.deploy();
    await marketInstance.deployed();
    const marketNftAddress = marketInstance.address;

    const Auction = await ethers.getContractFactory("Auction");
    const auctionInstance = await Auction.deploy();
    await auctionInstance.deployed();
    const autionAddress = auctionInstance.address;

    console.log({ autionAddress });

    const NFTContract = await ethers.getContractFactory("NFT");
    const nftInstance = await NFTContract.deploy(
      marketNftAddress,
      autionAddress
    );
    await nftInstance.deployed();
    const nftAddress = nftInstance.address;

    let listingPrice = await marketInstance.getListingPrice();
    listingPrice = listingPrice.toString();

    const tokenId1 = await nftInstance.createToken("https://mynft.com");
    const tokenId2 = await nftInstance.createToken("https://mynft.com");

    const autionPrice = ethers.utils.parseUnits("0.01", "ether");
    await marketInstance.createMarketItem(nftAddress, autionPrice, 1, {
      value: listingPrice,
    });
    await marketInstance.createMarketItem(nftAddress, autionPrice, 2, {
      value: listingPrice,
    });

    const [_, buyerAddress, thirdBuyer] = await ethers.getSigners();

    // marketInstance
    //   .connect(buyerAddress)
    //   .createmarketSale(1, nftAddress, { value: autionPrice });
    const items = await marketInstance.fetchMarketItem();
    const nftItems = await Promise.all(
      items.map(async (item) => {
        const tokenUrl = await nftInstance.tokenURI(item.tokenId);
        return {
          price: item.price.toString(),
          owner: item.onwer,
          seller: item.seller,
          tokenUrl,
          marketid: item.itemId.toString(),
          tokenId: item.tokenId.toString(),
        };
      })
    );

    const nftDetail = await marketInstance.getMarketItemDetail("1");
    const tokenUrl = await nftInstance.tokenURI(nftDetail.tokenId);
    // const meta = await axios.get(tokenUrl);
    const price = ethers.utils.formatUnits(nftDetail.price.toString(), "ether");
    const nftRes = {
      price,
      owner: nftDetail.onwer,
      seller: nftDetail.seller,
      tokenUrl,
      sold: nftDetail.sold,
      tokenId: nftDetail.tokenId.toString(),
    };

    const owners = await nftInstance.ownerOf(nftRes.tokenId);
    console.log({ owners });
    await marketInstance.approveAuction(nftAddress, autionAddress);

    const response = await auctionInstance.startBid(
      nftAddress,
      nftRes.tokenId,
      0,
      marketNftAddress,
      1
    );

    const bidAmount = ethers.utils.parseUnits("0.01", "ether");
    const res = await auctionInstance
      .connect(buyerAddress)
      .bid(1, { value: bidAmount });

    const bidAmounttwo = ethers.utils.parseUnits("0.05", "ether");
    await auctionInstance.connect(buyerAddress).bid(1, { value: bidAmounttwo });

    const bidAmountthird = ethers.utils.parseUnits("0.09", "ether");
    await auctionInstance.connect(thirdBuyer).bid(1, { value: bidAmountthird });
    const bidder = await auctionInstance.fetchBidder(1);

    const auct = await auctionInstance.getBidInfo(1);

    console.log({ bidder, auct });

    // console.log({ nftRes });
  });
});
