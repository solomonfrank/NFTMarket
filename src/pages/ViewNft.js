import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import Countdown from "react-countdown";
import web3Modal from "web3modal";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Table, Tag, Space, List, Card, Modal, message } from "antd";

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
  const [isCreator, setIsCreator] = useState(false);
  const [bidders, setBidder] = useState([]);
  const [loading, setLoading] = useState(false);

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

    const account = await provider.getSigner().getAddress();

    const auctionContract = new ethers.Contract(
      auctionAddress,
      Auction.abi,
      provider.getSigner()
    );

    const nftDetail = await contract.getMarketItemDetail(Number(id));
    const tokenUrl = await nft.tokenURI(nftDetail.tokenId);
    const meta = await axios.get(tokenUrl);
    const price = ethers.utils.formatUnits(nftDetail.price.toString(), "ether"); // format the ether from the smart contract
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
    setIsCreator(nftDetail.seller == account);
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
    const y = await provider.getSigner().getAddress();
    console.log(y);

    const nftCont = new ethers.Contract(
      nftAddress,
      NFT.abi,
      provider.getSigner()
    );

    const owner = await nftCont.ownerOf(id);
    console.log({ owner });

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
      bid: ethers.utils.formatUnits(item.bid.toString(), "ether"),
      bidder: item.bidder,
      marketId: item.marketId.toString(),
      auctionId: item.auctionId.toString(),

      action: "purchase",
    }));

    bidderArr.sort((a, b) => Number(b.bid) - Number(a.bid));
    console.log({ res, bidderArr });
    setBidder(bidderArr);
    setAuctionDetail(res);
  };

  useEffect(() => {
    getAuctionInfo(id);
  }, [id, reload]);

  const startOffer = async (bid) => {
    try {
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

      const tx = await marketNftContract.approveAuction(
        nftAddress,
        auctionAddress
      );
      await tx.wait();
      const response = await contract.startBid(
        nftAddress,
        nft.tokenId,
        bid,
        marketNftAddress,
        nft.marketId
      );
      await response.wait();
      message.success("Bid started");
      console.log({ response: nft.tokenId, mket: nft.marketId });
      getAuctionInfo(id);
    } catch (ex) {
      console.log(ex);
      message.err(ex.reason);
    }
  };

  const makeOffer = async (amt) => {
    if (auctionDetail.started) {
      try {
        setLoading(true);
        const web3modal = new web3Modal();
        const conn = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(conn);
        const signer = provider.getSigner();
        const biddingAmt = new ethers.utils.parseUnits(amt, "ether");
        const contract = new ethers.Contract(
          auctionAddress,
          Auction.abi,
          signer
        );
        const tx = await contract.bid(nft.marketId, { value: biddingAmt });
        await tx.wait();
        setLoading(false);
        setOpenModal(false);
        message.success("Bid successfully");
      } catch (err) {
        setLoading(false);
        setOpenModal(false);
        console.log(err);
        console.log("err", err.message);
        message.error(err.reason);
      }
    } else {
      message.error("Bid has not started");
    }
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

  const endBid = async () => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(auctionAddress, Auction.abi, signer);
    const txn = await contract.end(
      nftAddress,
      nft.tokenId,
      nft.marketId,
      marketNftAddress
    );
    txn.wait();
    console.log({ txn });
    setReload((prev) => !prev);
  };

  useEffect(() => {
    console.log({ auctionDetail });
  });

  const buyNft = async () => {
    if (auctionDetail.started) {
      const hide = message.loading("Loading..", 0);
      try {
        const web3modal = new web3Modal();
        const conn = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(conn);
        const signer = provider.getSigner();
        const price = new ethers.utils.parseUnits(nft.price, "ether");
        const contract = new ethers.Contract(
          marketNftAddress,
          NFTMarket.abi,
          signer
        );
        const tx = await contract.createmarketSale(nft.marketId, nftAddress, {
          value: price,
        });
        await tx.wait();
        setTimeout(hide, 0);
        message.success("Successfully");
      } catch (err) {
        setTimeout(hide, 0);
        console.log(err);

        message.error(err.reason);
      }
    } else {
      message.error("Bid has not started");
    }
  };

  return (
    <PageLayout>
      <Modal
        width={300}
        title="Enter Bid Amount"
        visible={openModal}
        onOk={() => makeOffer(bid)}
        onCancel={() => setOpenModal(false)}
        okText={loading ? "Bidding" : "Bid"}
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
          <h3 className="content-header-title">Details</h3>
          {isCreator && auctionDetail && !auctionDetail.started && (
            <button
              onClick={() => startOffer(0)}
              type="button"
              className="content-header-btn"
            >
              Start Offer
            </button>
          )}

          {isCreator &&
            auctionDetail &&
            auctionDetail.started &&
            !auctionDetail.ended && (
              <button
                onClick={() => endBid()}
                type="button"
                className="content-header-btn"
              >
                End Offer
              </button>
            )}
        </div>

        <div className="content-main">
          <div className="containerWrap">
            <div className="leftBio">
              <LazyLoadImage
                className="leftBio_photo"
                alt={nft?.title}
                effect="blur"
                //  height={image.height}
                src={nft?.image}
                // src={image.src} // use normal <img> attributes as props
                //  width={image.width}
              />
              {/* <img
                src={nft?.image}
                className="leftBio_photo"
                alt={nft?.title}
              /> */}
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
              {!isCreator && (
                <div className="btn-section">
                  <button onClick={buyNft} type="button" className="btn-buy">
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
              )}

              <div className="bidder-section">
                <h3 className="bidder-title">Bidders</h3>
                <Table
                  columns={columns}
                  dataSource={bidders}
                  pagination={false}
                  bordered={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NFTDetail;
