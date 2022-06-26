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
    try {
      const web3modal = new web3Modal();
      const conn = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(conn);

      const signer = provider.getSigner();
      console.log({ signer });

      let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
      const tx = await contract.voteProposal(
        location.state.id,
        vote,
        nftAddress
      );
      await tx.wait();
      setReload((prev) => !prev);
      console.log({ tx });
    } catch (ex) {
      message.error(ex.message);
    }
  };

  const countVoteHandler = async () => {
    try {
      const web3modal = new web3Modal();
      const conn = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(conn);

      const signer = provider.getSigner();
      console.log({ signer });

      let contract = new ethers.Contract(daoAddress, DAO.abi, signer);
      const tx = await contract.countVotes(location.state.id, nftAddress);
      await tx.wait();
      alert("Vote counted");
    } catch (ex) {
      console.log(ex);
      message.error("You are not the creator.");
    }
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
        owner: item.owner,
        id: idx + 1,
      };
    });

    console.log({ result });
    const response = {
      voteFor: result.voteUp.toString(),
      voteAgainst: result.voteDown.toString(),
      description: result.description,
      passed: result.passed,
      owner: result.owner,
      countConducted: result.countConducted,
      deadline: result.deadline.toString(),
    };

    console.log({ response });
    setproposal(response);
    setVoterStatus(voters);
  };

  const expired = (proposal) => {
    const currentTime = Date.now() / 1000;
    const proposalTime = proposal.deadline;
    console.log({ proposalTime, currentTime });
    if (proposalTime > currentTime) {
      return false;
    }

    return true;
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

          {proposal && !proposal.countConducted && (
            <button onClick={countVoteHandler} className="content-header-btn">
              Count Vote
            </button>
          )}
        </div>

        <div className="content-main-dr">
          <div className="mainContainer">
            <div className="proposer-title">{proposal?.description}</div>
            <div className="propsConts">
              {proposal && !proposal.countConducted ? (
                <Tag color="blue" text="Ongoing" fontSize="14px" />
              ) : (
                <Tag
                  color={proposal && proposal.passed ? "green" : "red"}
                  text={proposal && proposal.passed ? "Passed" : "Rejected"}
                  fontSize="14px"
                />
              )}

              <div className="proposer">
                <span className="proposerBY">Proposer By</span>
                <Tooltip content={proposal?.owner}>
                  <Blockie seed={proposal?.owner} />
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
