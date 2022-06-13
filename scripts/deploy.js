// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auctionContract = await Auction.deploy();
  await auctionContract.deployed();
  const auctionAddress = auctionContract.address;

  const MarketNFT = await hre.ethers.getContractFactory("NftMarket");
  const marketNftContract = await MarketNFT.deploy(auctionAddress);
  await marketNftContract.deployed();

  const marketNftAddress = marketNftContract.address;

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nftInstance = await NFT.deploy(marketNftAddress, auctionAddress);

  await nftInstance.deployed();

  const DAO = await hre.ethers.getContractFactory("MyDao");
  const DAOContract = await DAO.deploy();
  await DAOContract.deployed();

  console.log("NFt  deployed to:", nftInstance.address);
  console.log("marketNft  deployed to:", marketNftAddress);
  console.log("auction   deployed to:", auctionAddress);
  console.log("DAOContract   deployed to:", DAOContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
