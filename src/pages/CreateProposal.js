import React, { useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { ethers } from "ethers";
import { message } from "antd";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import DAO from "../artifacts/contracts/dao/governance_standard/dao.sol/MyDao.json";
import { nftAddress, marketNftAddress } from "../config";

import PageLayout from "../layout";
import { Widget, Table, Form } from "web3uikit";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const CreateProposal = () => {
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
          <h3 className="content-header-title">Governance overview</h3>
        </div>
        <div className="content-main">
          <div className="widgets" style={{ display: "flex", gap: "20px" }}>
            <Widget
              info={52}
              title="Proposals created"
              style={{ width: "25%" }}
            >
              <div className="extraWidgetInfo">
                <div className="extraTitle">Pass Rate</div>
                <div className="progress">
                  <div
                    className="progressPercentage"
                    style={{ width: `${60}%` }}
                  ></div>
                </div>
              </div>
            </Widget>
            <Widget
              style={{ width: "25%" }}
              info={422}
              title="Eligible voters"
            />
            <Widget
              style={{ width: "25%" }}
              info={4}
              title="Ongoing Proposal"
            />
          </div>
          <div style={{ marginTop: "30px", width: "80%" }}>
            <Table
              columnsConfig="10% 70% 20%"
              data={[]}
              header={[
                <span>Id</span>,
                <span>Description</span>,
                <span>Status</span>,
              ]}
              maxPages={3}
              pageSize={5}
            />
          </div>

          <div style={{ marginTop: "30px", width: "80%" }}>
            <Form
              buttonConfig={{
                text: "Submit Proposal",
                theme: "secondary",
                isLoading: false,
                loadingText: "Submitting Proposal",
              }}
              data={[
                {
                  key: "description",
                  name: "description",
                  type: "textarea",
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
              title="Create a new proposal"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateProposal;
