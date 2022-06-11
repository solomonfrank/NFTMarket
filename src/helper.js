import { network } from "hardhat";

export const moveBlock = async (amount) => {
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
  console.log(`Moved${amount} blocks `);
};
