import React, { useEffect, useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Layout, Table, Tag } from "antd";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFtMarket.sol/NftMarket.json";
import DAO from "../artifacts/contracts/dao.sol/MyDao.json";
import { nftAddress, marketNftAddress, daoAddress } from "../config";

import PageLayout from "../layout";
import { Widget, Form } from "web3uikit";
import { Header } from "antd/lib/layout/layout";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const CreateProposal = () => {
  const [proposalDescription, setProposalDescription] = useState();
  const [reloadProposal, setReloadProposal] = useState(false);
  const [proposals, setProposal] = useState([]);
  const [proposalCount, setProposalCount] = useState();

  const createProposal = async (data) => {
    try {
      const web3modal = new web3Modal();
      const conn = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(conn);

      const signer = provider.getSigner();
      let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
      const tx = await contract.createProposal(data, nftAddress);
      await tx.wait();
      setReloadProposal((prev) => !prev);
      console.log({ tx });
    } catch (err) {
      console.log(err.toString());
    }
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    await createProposal(proposalDescription);
  };

  const loadProposal = async () => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();
    let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
    const proposal = await contract.fetchProposal();

    const result = proposal.map((item) => ({
      id: item.id.toString(),
      description: item.description,
      status: item.passed,
      action: item.id.toString(),
    }));
    setProposalCount(result.length);
    setProposal(result);
    console.log({ result });
  };

  useEffect(() => {
    loadProposal();
  }, [reloadProposal]);

  const columns = [
    {
      title: "Id",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (item) =>
        item.status ? (
          <Tag color="success">Passed</Tag>
        ) : (
          <Tag color="error">Not passed</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      //     dataIndex: "action",
      render: (item) => (
        <Link to={`/proposal/${item.id}`} state={item}>
          View
        </Link>
      ),
    },
  ];

  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">Governance overview</h3>
        </div>
        <div
          className="widgets"
          style={{ display: "flex", gap: "20px", marginBottom: "15px" }}
        >
          <Widget
            info={proposalCount}
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
          <Widget style={{ width: "25%" }} info={422} title="Eligible voters" />
          <Widget style={{ width: "25%" }} info={4} title="Ongoing Proposal" />
        </div>
        <div className="content-main-crete">
          <div style={{ marginTop: "30px", width: "80%" }}>
            <Table columns={columns} dataSource={proposals} />
          </div>

          <Layout style={{ marginTop: "30px", width: "80%" }}>
            <h4 className="create-proposal-header">Create Proposal</h4>
            <form onSubmit={submitProposal}>
              <div className="proposal-wrap">
                <textarea
                  className="proposal-text"
                  rows={6}
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
                <button className="proposal-btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </Layout>
          <Layout style={{ marginTop: "30px", width: "80%" }}>
            <h4 className="create-proposal-header">Create Proposal</h4>
            <form onSubmit={submitProposal}>
              <div className="proposal-wrap">
                <textarea
                  className="proposal-text"
                  rows={6}
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
                <button className="proposal-btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </Layout>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateProposal;
