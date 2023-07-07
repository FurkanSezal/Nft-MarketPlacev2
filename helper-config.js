const { ethers } = require("hardhat");

const networkConfig = {
  11155111: {
    name: "sepolia",
  },
  31337: {
    name: "hardhat",
  },
  80001: {
    name: "mumbai",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = { developmentChains, networkConfig };
