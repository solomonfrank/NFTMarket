import React, { useEffect, useState } from "react";
import { create } from "ipfs-http-client";
import web3Modal from "web3modal";
import { ethers } from "ethers";
import { message, Tooltip, Radio, Space, Layout, Table } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

import DAO from "../artifacts/contracts/dao.sol/MyDao.json";
import { nftAddress, marketNftAddress, daoAddress } from "../config";

import PageLayout from "../layout";
import { Widget, Blockie, Tag } from "web3uikit";
import { useLocation } from "react-router-dom";

const client = create("https://ipfs.infura.io:5001/api/v0");
// const client = create();

const Proposal = () => {
  const location = useLocation();
  const [proposal, setproposal] = useState();
  const [reload, setReload] = useState(false);
  const [voterStatus, setVoterStatus] = useState([]);

  const [votedValue, setVotedValue] = useState(1);
  const voteProposal = async (vote) => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();
    console.log({ signer });

    let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
    const tx = await contract.voteProposal(location.state.id, vote, nftAddress);
    await tx.wait();
    setReload((prev) => !prev);
    console.log({ tx });
  };

  const countVoteHandler = async () => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();
    console.log({ signer });

    let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
    const tx = await contract.countVotes(location.state.id);
    await tx.wait();
    alert("Vote counted");
  };

  const onChange = (e) => {
    setVotedValue(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log({ votedValue });
    voteProposal(votedValue);
  };

  const fetchPropsalDetail = async (id) => {
    const web3modal = new web3Modal();
    const conn = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);

    const signer = provider.getSigner();
    console.log({ signer });
    const blockNumber = await provider.getBlockNumber();
    console.log({ blockNumber });

    let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
    const result = await contract.fetchProposalItem(id);

    const voters = result.canVote.map((item, idx) => {
      console.log({ votey: item.voter });
      return {
        address: item.voter,
        status: item.status,
        id: idx + 1,
      };
    });

    console.log({ result });
    const response = {
      voteFor: result.voteUp.toString(),
      voteAgainst: result.voteDown.toString(),
      description: result.description,
      passed: result.passed,
    };
    setproposal(response);
    setVoterStatus(voters);
  };

  useEffect(() => {
    fetchPropsalDetail(location.state?.id);
  }, [location.state?.id, reload]);

  const columns = [
    {
      title: "Id",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Address",
      key: "address",
      dataIndex: "address",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (item) =>
        item ? (
          <CheckCircleFilled style={{ color: "green" }} />
        ) : (
          <CloseCircleFilled style={{ color: "red" }} />
        ),
    },
  ];

  return (
    <PageLayout>
      <div>
        <div className="content-header">
          <h3 className="content-header-title">overview</h3>

          {proposal && proposal.countConducted && (
            <button onClick={countVoteHandler} className="content-header-btn">
              Count Vote
            </button>
          )}
        </div>

        <div className="content-main-dr">
          <div className="mainContainer">
            <div className="proposer-title">{proposal?.description}</div>
            <div className="propsConts">
              <Tag
                color={proposal && proposal.passed ? "green" : "red"}
                text={proposal && proposal.passed ? "Passed" : "Rejected"}
                fontSize="14px"
              />
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
              info={proposal?.voteFor}
              title="Voter For"
              style={{ width: "25%" }}
            ></Widget>
            <Widget
              style={{ width: "25%" }}
              info={proposal?.voteAgainst}
              title="Voter Against"
            />
          </div>
          <div style={{ marginTop: "30px", width: "80%" }}>
            <Table columns={columns} dataSource={voterStatus} />
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
