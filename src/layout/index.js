import React from "react";

import { Layout, Menu } from "antd";

import { useState } from "react";
import { IoIosRocket } from "react-icons/io";
import { GiMining, GiVote } from "react-icons/gi";
import { FaWallet } from "react-icons/fa";

import {
  TiSocialTwitter,
  TiSocialLinkedin,
  TiSocialFacebook,
} from "react-icons/ti";
import { SiMicrosoftexchange } from "react-icons/si";
import { BsShieldFill } from "react-icons/bs";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";

import Web3Modal from "web3modal";
import { create } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";
import { nftAddress, marketNftAddress } from "../config";

import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import { Link } from "react-router-dom";

const { Header, Content, Sider } = Layout;

let provider;

const client = create("http://127.0.0.1:5002");

const PageLayout = ({ children }) => {
  const [connected, setConnected] = useState();
  const [nftItems, setNftItems] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const buyNft = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
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
          name: meta.data.title,
          description: meta.data.description,
        };
      })
    );
    setNftItems(nftItems);
  };

  const connectWallet = async () => {
    const web3modal = new Web3Modal();
    provider = await web3modal.connect();
    setConnected(true);
    console.log({ provider });
  };

  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  const items = [
    getItem("Nft Art", "1", <BsShieldFill />),
    getItem("Mining", "2", <GiMining />),
    getItem("Exchange", "3", <SiMicrosoftexchange />),
    getItem("DAO", "4", <GiVote />),
  ];

  return (
    <Layout>
      <Header
        className="header"
        style={{
          backgroundColor: "#24272E",
          display: "flex",
          // alignItems: "center",
          height: "10vh",
          paddingLeft: "24px",
          boxShadow: "rgb(0 0 0 / 20%) 0px 3px 7px -1px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          className="logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "220px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <IoIosRocket color="#E2B93B" size={30} />
          </span>
          <span style={{ color: "#fff", fontSize: "25px" }}>NFT Pro</span>
        </div>

        <Menu
          mode="horizontal"
          // defaultSelectedKeys={["2"]}
          style={{
            backgroundColor: "#24272E",
            color: "#fff",
            borderBottom: "none",
            marginRight: "auto",
          }}
          className="header-link"
        >
          <Menu.Item key="1" style={{ paddingTop: "5px" }}>
            <Link to="/creator-asset">Creator Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" style={{ paddingTop: "5px" }}>
            <Link to="/user-asset">My Assets</Link>
          </Menu.Item>
          <Menu.Item key="3" style={{ paddingTop: "5px" }}>
            <Link to="/create"> Sell Assets</Link>
          </Menu.Item>
        </Menu>

        <button className="connect-wallet" onClick={connectWallet}>
          <span className="wallet-icon-wrap">
            <FaWallet />
          </span>
          {connected ? (
            <span>Wallet Connected</span>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      </Header>
      <Layout style={{ height: "90vh" }}>
        <Sider
          width={220}
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            backgroundColor: "#24272E",
            boxShadow: "rgb(0 0 0 / 20%) 0px 3px 7px -1px",
            borderRight: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div
            style={{
              display: " flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <Menu
              style={{
                backgroundColor: "#24272E",
                color: "#ffff",
                marginTop: "30px",
              }}
              mode="inline"
              className="sidebar-link"
              items={items}
            />

            <div style={{ color: "#fff", padding: "25px" }}>
              <span>
                <TiSocialTwitter size={30} color="rgba(255, 255, 255, 0.3)" />
              </span>
              <span>
                <TiSocialLinkedin size={30} color="rgba(255, 255, 255, 0.3)" />
              </span>
              <span>
                <TiSocialFacebook size={30} color="rgba(255, 255, 255, 0.3)" />
              </span>
            </div>
          </div>
        </Sider>
        <Layout
          style={{
            padding: "0 24px 24px",
            backgroundColor: "#2C2C34",
            height: "90vh",
          }}
        >
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default PageLayout;
