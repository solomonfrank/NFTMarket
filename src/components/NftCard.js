import React from "react";
import { AiFillStar } from "react-icons/ai";
import { ethers } from "ethers";

import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import Web3Modal from "web3modal";
import { nftAddress, marketNftAddress } from "../config";
import { Link } from "react-router-dom";

const NFtCard = ({ item, reload }) => {
  const buyNft = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketNftContract = new ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether"); //  convert to wei
    const transaction = await marketNftContract.createmarketSale(
      nft.tokenId,
      nftAddress,
      {
        value: price,
      }
    );

    await transaction.wait();
    reload();
  };
  return (
    <div className="list-item">
      <img src={item.image} className="nft-photo" alt={item.title} />
      <div className="nft-footer">
        <div className="nft-upper">
          <h3 className="nft-upper-title">
            <Link to={`/asset/${item.marketId}`}>{item.title}</Link>
          </h3>
          <span>
            <AiFillStar color="#e2b93b" />
          </span>
        </div>
        <div className="nft-upper">
          <h3 className="nft-upper-title">Price</h3>
          <span className="price-tag">{item.price}ETH</span>
        </div>
        <div className="mint-btn-wrap">
          <button onClick={() => buyNft(item)} className="mint-btn">
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFtCard;
