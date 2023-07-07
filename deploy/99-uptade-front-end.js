const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractsFile =
  "../../cryptoarthub/constants/networkMapping.json";
const fromEndAbiLocation = "../../cryptoarthub/constants/";
module.exports = async function () {
  if (process.env.UPTADE_FRONT_END) {
    console.log("uptading front end ...");
    await updateContractAddresses();
    await uptadeAbi();
  }
};

async function uptadeAbi() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  fs.writeFileSync(
    `${fromEndAbiLocation}NftMarketplaceAbi.json`,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );

  const basicNft = await ethers.getContract("BasicNft");
  fs.writeFileSync(
    `${fromEndAbiLocation}BasicNftAbi.json`,
    basicNft.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");

  const chainId = network.config.chainId.toString();

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );

  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["NftMarketplace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];
