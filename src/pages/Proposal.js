import React, { useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { ethers } from "ethers";
import { message, Tooltip, Radio, Space, Layout } from "antd";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import DAO from "../artifacts/contracts/dao.sol/MyDao.json";
import { nftAddress, marketNftAddress, daoAddress } from "../config";

import PageLayout from "../layout";
import { Widget, Table, Form, Blockie, Tag } from "web3uikit";
import { useLocation } from "react-router-dom";
import { Header } from "antd/lib/layout/layout";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const Proposal = () => {
  const location = useLocation();

  const [votedValue, setVotedValue] = useState(1);
  const voteProposal = async (vote) => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();
    console.log({ signer });

    let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
    const tx = await contract.voteProposal(location.state.id, vote);
    await tx.wait();
    console.log({ tx });
  };

  const countVoteHandler = () => {};

  const onChange = (e) => {
    setVotedValue(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log({ votedValue });
    voteProposal(votedValue);
  };

  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">overview</h3>

          {location.state && !location.state.status && (
            <button onClick={countVoteHandler} className="content-header-btn">
              Count Vote
            </button>
          )}
        </div>

        <div className="content-main">
          <div className="mainContainer">
            <div className="proposer-title">
              {" "}
              We should accept crypto as a payment gateway
            </div>
            <div className="propsConts">
              <Tag color="red" text="Rejected" fontSize="14px" />
              <div className="proposer">
                <span className="proposerBY">Proposer By</span>
                <Tooltip content="0x">
                  <Blockie seed="0x" />
                </Tooltip>
              </div>
            </div>
          </div>

          <div
            className="widgets"
            style={{ display: "flex", gap: "20px", marginTop: "30px" }}
          >
            <Widget
              info={52}
              title="Voter For"
              style={{ width: "25%" }}
            ></Widget>
            <Widget style={{ width: "25%" }} info={422} title="Voter Against" />
          </div>
          <div style={{ marginTop: "30px", width: "80%" }}>
            <Table
              columnsConfig="80% 20%"
              data={[]}
              header={[<span>Address</span>, <span>Vote</span>]}
              maxPages={3}
              pageSize={5}
            />
          </div>

          <Layout style={{ marginTop: "30px", width: "80%", padding: "20px" }}>
            <header style={{ marginBottom: "10px", fontWeight: "500" }}>
              Vote Proposal
            </header>
            <form onSubmit={submitHandler}>
              <Radio.Group onChange={onChange} value={votedValue}>
                <Space direction="vertical">
                  <Radio value={true}>For</Radio>
                  <Radio value={false}>Against</Radio>
                </Space>
              </Radio.Group>
              <div style={{ marginTop: "20px" }}>
                <button type="submit">Submit Vote</button>
              </div>
            </form>
          </Layout>
        </div>
      </div>
    </PageLayout>
  );
};

export default Proposal;
