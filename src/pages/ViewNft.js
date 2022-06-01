import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import Countdown from "react-countdown";
import web3Modal from "web3modal";
import { Table, Tag, Space, List, Card, Modal } from "antd";

import PageLayout from "../layout";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import Auction from "../artifacts/contracts/Auction.sol/Auction.json";
import { nftAddress, marketNftAddress, auctionAddress } from "../config";

const NFTDetail = () => {
  const { id } = useParams();
  const [nft, setNft] = useState();
  const [bid, setBid] = useState();
  const [reload, setReload] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [auctionDetail, setAuctionDetail] = useState();
  const [bidders, setBidder] = useState([]);

  const loadNFT = async (id) => {
    const web3modal = new web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    let nft = new ethers.Contract(nftAddress, NFT.abi, provider.getSigner());
    const contract = new ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      provider.getSigner()
    );

    const auctionContract = new ethers.Contract(
      auctionAddress,
      Auction.abi,
      provider.getSigner()
    );

    const nftDetail = await contract.getMarketItemDetail(Number(id));
    const tokenUrl = await nft.tokenURI(nftDetail.tokenId);
    const meta = await axios.get(tokenUrl);
    const price = ethers.utils.formatUnits(nftDetail.price.toString(), "ether");
    const nftRes = {
      price,
      owner: nftDetail.onwer,
      seller: nftDetail.seller,
      tokenUrl,
      marketId: nftDetail.itemId.toString(),
      sold: nftDetail.sold,
      tokenId: nftDetail.tokenId.toString(),
      title: meta.data.title,
      image: meta.data.image,
      description: meta.data.description,
    };
    setNft(nftRes);
    setReload((prev) => !prev);
  };

  useEffect(() => {
    loadNFT(id);
  }, [id]);

  const getAuctionInfo = async (id) => {
    console.log({ id });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      auctionAddress,
      Auction.abi,
      provider.getSigner()
    );

    const auctionDetail = await contract.getBidInfo(id);
    const bidders = await contract.fetchBidder(id);

    console.log({ bidders: bidders.length });

    const res = {
      startDate: auctionDetail.startDate.toString(),
      endDate: auctionDetail.endAt.toString(),
      ended: auctionDetail.ended,
      started: auctionDetail.started,
      highestBidder: auctionDetail.highestBidder,
      highestBid: auctionDetail.highestBid.toString(),
    };

    const bidderArr = bidders.map((item) => ({
      bid: item.bid.toString(),
      bidder: item.bidder,
      marketId: item.marketId.toString(),
      auctionId: item.auctionId.toString(),
      action: "purchase",
    }));
    console.log({ res, bidderArr });
    setBidder(bidderArr);
    setAuctionDetail(res);
  };

  useEffect(() => {
    getAuctionInfo(id);
  }, [id]);

  const startOffer = async (bid) => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);
    const signer = provider.getSigner();
    console.log({ signer });
    const contract = new ethers.Contract(auctionAddress, Auction.abi, signer);
    const marketNftContract = new ethers.Contract(
      marketNftAddress,
      NFTMarket.abi,
      signer
    );

    await marketNftContract.approveAuction(nftAddress, auctionAddress);
    await contract.startBid(
      nftAddress,
      nft.tokenId,
      bid,
      marketNftAddress,
      nft.marketId
    );
  };

  const makeOffer = async (bid) => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(auctionAddress, Auction.abi, signer);
    await contract.bid();
  };

  const columns = [
    {
      title: "Bid",
      dataIndex: "bid",
      key: "bid",
    },
    {
      title: "Bidder",
      dataIndex: "bidder",
      key: "bidder",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];

  return (
    <PageLayout>
      <Modal
        width={300}
        title="Enter Bid Amount"
        visible={openModal}
        onOk={() => makeOffer(bid)}
        onCancel={() => setOpenModal(false)}
      >
        <div className="bidAmountWrap">
          <input
            type="number"
            className="bidAmount"
            onChange={(e) => setBid(e.target.value)}
          />
        </div>
      </Modal>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">Cryptographics</h3>
          {auctionDetail && !auctionDetail.started && (
            <button
              onClick={() => startOffer(0)}
              type="button"
              className="content-header-btn"
            >
              Start Offer
            </button>
          )}
        </div>

        <div className="content-main">
          <div className="containerWrap">
            <div className="leftBio">
              <img
                src={nft?.image}
                className="leftBio_photo"
                alt={nft?.title}
              />
              <div className="nft-desc">
                <h3 className="desc-title">Description</h3>
                <div className="nft-content">{nft?.description}</div>
              </div>
            </div>
            <div className="rightBid">
              <h3 className="rightBid_title">{nft?.title}</h3>
              <div className="price-sec">
                <div className="price-left">
                  <h6 className="price-val-title">Price</h6>
                  <div className="price-val">{nft?.price}ETH</div>
                </div>
                <div className="price-right">
                  {auctionDetail && Number(auctionDetail.endDate) > 0 && (
                    <>
                      <h6 className="price-val-title">End</h6>
                      <div className="price-val">
                        <Countdown date={Number(auctionDetail.endDate * 1000)}>
                          <span>Expired!</span>
                        </Countdown>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="btn-section">
                <button type="button" className="btn-buy">
                  Buy
                </button>
                <button
                  type="button"
                  className="btn-offer"
                  onClick={() => setOpenModal(true)}
                >
                  Make Offer
                </button>
              </div>
              <div className="bidder-section">
                <h3 className="bidder-title">Bidders</h3>

                {auctionDetail && auctionDetail.started && (
                  <div>
                    <Table
                      columns={columns}
                      dataSource={bidders}
                      pagination={false}
                      bordered={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NFTDetail;
