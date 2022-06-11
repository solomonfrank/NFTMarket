require("@nomiclabs/hardhat-waffle");
const fs = require("fs");

const privateKey = fs.readFileSync(".secret").toString();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropstein: {
      url: "https://ropsten.infura.io/v3/82cf4e62885345ea9398de9b5bcf8e71",
      accounts: [privateKey],
    },
  },
};
