import web3Modal from "web3modal";
import { ethers } from "ethers";

export const web3ConnHandler = async ({
  defaultConn,
  contractAddress,
  abi,
}) => {
  const web3modal = new web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(
    defaultConn ? window.ethereum : connection
  );
  const signer = provider.getSigner();
  console.log({ contractAddress, abi });
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return [contract, signer];
};
