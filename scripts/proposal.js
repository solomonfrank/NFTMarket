import { ethers, network } from "hardhat";

import {
  FUNC,
  FUNC_ARGS,
  DESCRIPTION,
  VOTING_DELAY,
  developmentChain,
} from "../src/config";
import { moveBlock } from "../src/helper";

const makeProposal = async (
  functionToCall,
  functionToCallArgs,
  description
) => {
  const governorContract = await ethers.getContractAt("GovernorContract");
  const box = await ethers.getContractAt("Box");

  const encodedFuncToCall = box.interface.encodeFunctionData(
    functionToCall,
    functionToCallArgs
  );
  const propseTnx = await governorContract.propose(
    box.address,
    [0],
    [encodedFuncToCall],
    description
  );

  const proposeReceipt = await propseTnx.wait(1);

  if (developmentChain.includes(network.name)) {
    await moveBlock(VOTING_DELAY + 1);
  }

  const proposalid = proposeReceipt.events[0].args.proposalId;
};

makeProposal(FUNC, FUNC_ARGS, DESCRIPTION)
  .then(() => process.exit(0))
  .catch((err) => console.log(err));
