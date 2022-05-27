import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import "./App.css";

import { useEffect, useState } from "react";

import NFT from "./artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "./artifacts/contracts/NFtMarket.sol/NftMarket.json";

import web3Modal from "web3modal";
import { create } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";
import { nftAddress, marketNftAddress } from "./config";

const client = create("http://127.0.0.1:5002");
function App() {
  const [url, setUrl] = useState();

  const onChange = async (e) => {
    const file = e.target.files[0];
    try {
      const { path } = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${path}`;
    } catch (ex) {}
  };

  const createItem = async () => {
    const req = {
      name,
      description,
      price,
      url,
    };

    try {
      const { path } = await client.add(req);
      const url = `https://ipfs.infura.io/ipfs/${path}`;
      createSale(url);
    } catch (err) {}
  };

  const createSale = async () => {
    const web3modal = new web3Modal();
    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftAddress, NFT.abi, signer);

    let transaction = await contract.createToken(ur);
    const tx = transaction.wait();
    const event = tx.events[0];
    let value = event.args[2];
    const tokenId = value.toNumber();

    contract = new ethers.Contract(marketNftAddress, NFTMarket.abi, signer);

    const price = ethers.utils.parseUnits(price, "ether");
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    transaction = await contract.createMarketItem(nftAddress, price, tokenId, {
      value: listingPrice,
    });

    await transaction.wait();
  };
  const buyNft = async (nft) => {
    const web3Modal = new web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketNftContract = ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await marketNftContract.createmarketSale(
      nft.tokenId,
      nftAddress,
      { value: price }
    );
    await transaction.wait();
    loadNft();
  };
  const loadNft = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(
      nftAddress,
      NFT.abi,
      provider.getSigner()
    );

    const marketContract = new ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      provider.getSigner()
    );
    const items = await marketContract.fetchMarketItem();
    const nftItems = await Promise.all(
      items.map(async (item) => {
        const tokenUrl = await tokenContract.tokenURI(item.tokenId);
        const meta = await axios.get(tokenUrl);
        const price = ethers.utils.formatUnits(item.price.toString(), "ether");
        return {
          price,
          owner: item.onwer,
          seller: item.seller,
          tokenUrl,
          tokenId: item.tokenId.toString(),
          name: meta.data.name,
          description: meta.data.description,
        };
      })
    );
  };

  useEffect(() => {
    loadNft();
  }, []);
  console.log({ greeterAbi: Greeter.abi });
  return <div className="App">hello world</div>;
}

export default App;
