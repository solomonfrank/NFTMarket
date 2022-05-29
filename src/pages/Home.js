import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";

import NFtCard from "../components/NftCard";
import PageLayout from "../layout";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import { nftAddress, marketNftAddress } from "../config";

const Home = () => {
  const [nftItems, setNftItems] = useState([]);
  const [reload, setReload] = useState(false);
  const loadNFT = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let nft = new ethers.Contract(nftAddress, NFT.abi, provider.getSigner());
    const contract = new ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      provider.getSigner()
    );

    const items = await contract.fetchMarketItem();
    console.log({ items });
    const nftItems = await Promise.all(
      items.map(async (item) => {
        const tokenUrl = await nft.tokenURI(item.tokenId);
        const meta = await axios.get(tokenUrl);
        const price = ethers.utils.formatUnits(item.price.toString(), "ether");
        return {
          price,
          owner: item.onwer,
          seller: item.seller,
          tokenUrl,
          sold: item.sold,
          tokenId: item.tokenId.toString(),
          title: meta.data.title,
          image: meta.data.image,
          description: meta.data.description,
        };
      })
    );
    setNftItems(nftItems);
    console.log({ nftItems });
  };

  useEffect(() => {
    loadNFT();
  }, [reload]);
  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">Cryptographics</h3>
          <Link to="/create" className="content-header-btn">
            Create new Item
          </Link>
        </div>

        <div className="content-main">
          {nftItems.length ? (
            <div className="list-wrapper">
              {nftItems.map((item) => (
                <NFtCard
                  key={item.tokenId}
                  item={item}
                  reload={() => setReload((prev) => !prev)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                color: "#fff",
                textAlign: "center",
                textTransform: "capitalize",
                fontSize: "23px",
              }}
            >
              No art at the moment!
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;
