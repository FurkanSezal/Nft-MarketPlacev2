const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.01");
const PIECE = 3;
const TOKEN_ID = 1;

async function mintAndList() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");

  console.log("Approving Nft...");
  console.log("address: ", nftMarketplace.address);

  // register for only for one time
  /* const tx_r = await nftMarketplace.register(
    "0xEaC9eDFE37fA378E8795253d292e6393d29aBCa2"
  );
  await tx_r.wait(1); */
  /* 
  const apporveNftTx = await basicNft.setApprovalForAll(
    nftMarketplace.address,
    true
  );
  await apporveNftTx.wait(1); */
  console.log("Listing Nft ...");
  const tx = await nftMarketplace.listItem(
    basicNft.address,
    TOKEN_ID,
    PRICE,
    PIECE
  );
  await tx.wait(1);
  console.log("Listed!");

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
