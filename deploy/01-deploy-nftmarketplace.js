const { getNamedAccounts, deployments, network } = require("hardhat");
const { developmentChains } = require("../helper-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];

  const nftMarketplace = await deploy("NftMarketplace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`nftMarketplace deployed at ${nftMarketplace.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(nftMarketplace.address, args);
  }

  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args: [nftMarketplace.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`basicNft deployed at ${basicNft.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(basicNft.address, [nftMarketplace.address]);
  }
};

module.exports.tags = ["all", "nftmarketplace"];
