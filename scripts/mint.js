const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

async function mint() {
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minting...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log(`Token ID: ${tokenId}`);
  console.log(`NFT Address: ${basicNft.address}`);

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }

  let slot = 0;
  for (let i = 0; i < 8; i++) {
    slot = await ethers.provider.getStorageAt(basicNft.address, i);
    console.log(`Slot${i} : ${slot}`);
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
