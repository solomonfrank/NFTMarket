import React, { useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { ethers } from "ethers";
import { message } from "antd";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import { nftAddress, marketNftAddress } from "../config";
import { web3ConnHandler } from "../utils/useContract";

import PageLayout from "../layout";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const CreateNFT = () => {
  const [fileUrl, setFileUrl] = useState();
  const [connected, setConnected] = useState();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState();
  const [title, setTitle] = useState();
  const [price, setPrice] = useState();
  const [totalMint, setTotalmint] = useState();
  const inputRef = useRef();

  const fetchTotalMint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      nftAddress,
      NFT.abi,
      provider.getSigner()
    );
    const totalSupply = await contract.totalSupply();
    setTotalmint(totalSupply.toString());
    console.log({ totalSupply: totalSupply.toString() });
  };

  useEffect(() => {
    fetchTotalMint();
  }, []);

  const onChange = async (e) => {
    const file = e.target.files[0];
    console.log({ file });
    try {
      const fileResponse = await client.add(file);
      console.log({ fileResponse });
      const url = `https://ipfs.infura.io/ipfs/${fileResponse.path}`;
      setFileUrl(url);
      message.success("File uploaded to IPFS");
    } catch (ex) {
      console.log({ error: ex });
      message.error("Something went wrong");
    }
  };

  const createItem = async (e) => {
    e.preventDefault();
    if (!description || !title || !fileUrl || !price) {
      message.warning("Please fill all fields");
    } else {
      const req = {
        description,
        title,
        image: fileUrl,
      };

      console.log({ req });

      try {
        setLoading(true);
        const response = await client.add(JSON.stringify(req));
        const url = `https://ipfs.infura.io/ipfs/${response.path}`;
        console.log({ url });
        createSale(url);
      } catch (err) {
        setLoading(false);
        message.error("Some thing went wrong");
        console.log(err);
      }
    }
  };

  const createSale = async (url) => {
    try {
      // const web3modal = new web3Modal();
      // const connection = await web3modal.connect();

      // console.log({ connection });

      // const provider = new ethers.providers.Web3Provider(connection);
      // const signer = provider.getSigner();
      // console.log({ signer });
      // let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
      let [contract, signer] = await web3ConnHandler({
        defaultConn: false,
        contractAddress: nftAddress,
        abi: NFT.abi,
      });
      console.log({ contract, url });

      let transaction = await contract.createToken(url);
      console.log({ transaction });
      const tx = await transaction.wait();
      console.log({ tx });
      const event = tx.events[0];
      console.log({ event });
      let value = event.args[2];

      const tokenId = value.toNumber();
      console.log({ value, tokenId });
      contract = new ethers.Contract(marketNftAddress, NFTMarket.abi, signer);

      const autionPrice = ethers.utils.parseUnits(price, "ether"); // convert to wei
      let listingPrice = await contract.getListingPrice(); // return wei
      console.log({ before: listingPrice, autionPrice });
      listingPrice = listingPrice.toString();
      console.log({ after: listingPrice, autionPrice });
      transaction = await contract.createMarketItem(
        nftAddress,
        autionPrice,
        tokenId,
        {
          value: listingPrice,
        }
      );

      await transaction.wait();
      setDescription("");
      setTitle("");
      setPrice("");
      fetchTotalMint();
      inputRef.current.value = null;
      message.success("NFT created successfully");
    } catch (err) {
      console.log("create sale", err);
      message.error(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">Create NFT</h3>
          <div style={{ color: "#fff", fontSize: "15px" }}>
            Minted: {totalMint || 0}
          </div>
        </div>

        <div className="content-main-dr">
          <div className="form-wrapper">
            <h3 className="form-title">Setup NFT</h3>
            <form onSubmit={createItem}>
              <div className="form-input-wrap">
                <label for="title" className="form-input-label">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  className="form-input"
                  id="title"
                  placeholder="Title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-input-wrap">
                <label for="title" className="form-input-label">
                  Price
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="price"
                  value={price}
                  placeholder="price"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="form-input-wrap">
                <label for="description" className="form-input-label">
                  Description
                </label>
                <textarea
                  className="form-input"
                  id="description"
                  value={description}
                  placeholder="Description"
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="form-input-wrap">
                <label for="title" className="form-input-label">
                  Photo
                </label>
                <input
                  type="file"
                  className="form-input"
                  id="price"
                  ref={inputRef}
                  onChange={onChange}
                />
              </div>
              <div className="form-input-wrap">
                <button type="submit" className="form-submit">
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateNFT;
