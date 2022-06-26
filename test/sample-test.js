const { expect } = require("chai");

describe("NFTMarket", function () {
  it("Should create and execute market sale", async function () {
    const Auction = await ethers.getContractFactory("Auction");
    const auctionInstance = await Auction.deploy();
    await auctionInstance.deployed();
    const autionAddress = auctionInstance.address;

    const MarketContract = await ethers.getContractFactory("NftMarket");
    const marketInstance = await MarketContract.deploy(autionAddress);
    await marketInstance.deployed();
    const marketNftAddress = marketInstance.address;

    const NFTContract = await ethers.getContractFactory("NFT");
    const nftInstance = await NFTContract.deploy(
      marketNftAddress,
      autionAddress
    );
    await nftInstance.deployed();
    const nftAddress = nftInstance.address;
    console.log({ nftAddress });
    const DaoContract = await ethers.getContractFactory("MyDao");
    const daoInstance = await DaoContract.deploy();
    await daoInstance.deployed();
    const daoAddress = daoInstance.address;

    let listingPrice = await marketInstance.getListingPrice();
    listingPrice = listingPrice.toString();

    const [first, buyerAddress, thirdBuyer] = await ethers.getSigners();

    const trans = await nftInstance.createToken("https://mynft.com");
    const tx = await trans.wait();
    const tokenId2 = await nftInstance.createToken("https://mynft.com");
    const tokenId3 = await nftInstance
      .connect(buyerAddress)
      .createToken("https://mynft.com");

    const autionPrice = ethers.utils.parseUnits("0.01", "ether");
    await marketInstance.createMarketItem(nftAddress, autionPrice, 1, {
      value: listingPrice,
    });
    await marketInstance.createMarketItem(nftAddress, autionPrice, 2, {
      value: listingPrice,
    });

    const owners = await nftInstance.ownerOf(1);

    await marketInstance
      .connect(buyerAddress)
      .createMarketItem(nftAddress, autionPrice, 3, {
        value: listingPrice,
      });
    //.createmarketSale(1, nftAddress, { value: autionPrice });
    const items = await marketInstance.connect(buyerAddress).fetchitemcreated();
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

    console.log({ nftItems });

    const nftDetail = await marketInstance.getMarketItemDetail("1");
    const tokenUrl = await nftInstance.tokenURI(nftDetail.tokenId);

    const price = ethers.utils.formatUnits(nftDetail.price.toString(), "ether");
    const nftRes = {
      price,
      owner: nftDetail.onwer,
      seller: nftDetail.seller,
      tokenUrl,
      sold: nftDetail.sold,
      tokenId: nftDetail.tokenId.toString(),
    };

    await marketInstance.approveAuction(nftAddress, autionAddress);

    await auctionInstance.startBid(
      nftAddress,
      nftRes.tokenId,
      0,
      marketNftAddress,
      1
    );
    await auctionInstance.startBid(nftAddress, 2, 0, marketNftAddress, 2);

    const bidAmount = ethers.utils.parseUnits("0.01", "ether");
    // const res = await auctionInstance
    //   .connect(buyerAddress)
    //   .bid(1, { value: bidAmount });

    //  const bidAmounttwo = ethers.utils.parseUnits("0.05", "ether");
    // await auctionInstance.connect(buyerAddress).bid(1, { value: bidAmounttwo });

    // const bidAmountthird = ethers.utils.parseUnits("0.09", "ether");
    //  await auctionInstance.connect(thirdBuyer).bid(1, { value: bidAmountthird });
    const bidder = await auctionInstance.fetchBidder(1);
    // const bidder1 = await auctionInstance.fetchBidder(2);

    // await auctionInstance.end(nftAddress, 1, 1, marketNftAddress);
    const auct = await auctionInstance.getBidInfo(1);

    const ownersBid = await nftInstance.ownerOf(1);

    // await daoInstance
    //   .connect(buyerAddress)
    //   .createProposal("Create an nft for the project", nftInstance.address);

    await daoInstance
      //.connect(buyerAddress)
      .createProposal("Convert an nft for the project", nftInstance.address);
    const proposals = await daoInstance.fetchProposal();
    // console.log({ proposals });

    // const result = await marketInstance.connect(buyerAddress).fetchMyNFT();
    // console.log({ result });
    // const detail = await marketInstance
    //   .connect(buyerAddress)
    //   .getMarketItemDetail(1);
    // console.log({ detail });
  });
});
