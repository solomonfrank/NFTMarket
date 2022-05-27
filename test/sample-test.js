const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sale", async function () {
    const MarketContract = await ethers.getContractFactory("NftMarket");
    const marketInstance = await MarketContract.deploy();
    await marketInstance.deployed();
    const marketNftAddress = marketInstance.address;

    const NFTContract = await ethers.getContractFactory("NFT");
    const nftInstance = await NFTContract.deploy(marketNftAddress);
    await nftInstance.deployed();
    const nftAddress = nftInstance.address;

    let listingPrice = await marketInstance.getListingPrice();
    console.log({ before: listingPrice });
    listingPrice = listingPrice.toString();

    const tokenId1 = await nftInstance.createToken("https://mynft.com");
    const tokenId2 = await nftInstance.createToken("https://mynft.com");

    const autionPrice = ethers.utils.parseUnits("0.01", "ether");
    console.log({ tokenId1, tokenId2, nftAddress, autionPrice, listingPrice });
    await marketInstance.createMarketItem(nftAddress, autionPrice, 1, {
      value: listingPrice,
    });
    await marketInstance.createMarketItem(nftAddress, autionPrice, 2, {
      value: listingPrice,
    });

    const [_, buyerAddress] = await ethers.getSigners();

    marketInstance
      .connect(buyerAddress)
      .createmarketSale(1, nftAddress, { value: autionPrice });
    const items = await marketInstance.fetchMarketItem();
    const nftItems = await Promise.all(
      items.map(async (item) => {
        const tokenUrl = await nftInstance.tokenURI(item.tokenId);
        return {
          price: item.price.toString(),
          owner: item.onwer,
          seller: item.seller,
          tokenUrl,
          tokenId: item.tokenId.toString(),
        };
      })
    );

    console.log({ nftItems });
  });
});
