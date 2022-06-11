import React, { useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { ethers } from "ethers";
import { message, Tooltip } from "antd";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import DAO from "../artifacts/contracts/dao/governance_standard/dao.sol/MyDao.json";
import { nftAddress, marketNftAddress } from "../config";

import PageLayout from "../layout";
import { Widget, Table, Form, Blockie, Tag } from "web3uikit";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const Proposal = () => {
  const createProposal = () => {
    const web3modal = new web3Modal();
    const conn = web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();

    const contract = new ethers.Contract();
  };

  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">overview</h3>
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

          <div style={{ marginTop: "30px", width: "80%" }}>
            <Form
              buttonConfig={{
                text: "Vote",
                theme: "secondary",
                isLoading: false,
                loadingText: "Casting vote",
              }}
              data={[
                {
                  name: "Cast Vote",
                  type: "radios",
                  options: ["For", "Against"],
                  inputWidth: "100%",
                  validation: {
                    required: true,
                  },
                  value: "",
                },
              ]}
              onSubmit={(e) => {
                alert("submitted");
              }}
              title="Cast Vote"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Proposal;
