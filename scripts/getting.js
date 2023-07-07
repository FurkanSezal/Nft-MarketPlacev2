const { getNamedAccounts, ethers } = require("hardhat");
const abi = require("../abi");
async function main() {
  const { deployer } = await getNamedAccounts();
  const SolidityBasicsNFT = await ethers.getContractAt(
    abi,
    "0xA457A0F9b6EDbEc66941D7Ed1D4d4834330ABf52",
    deployer
  );
  let slot = 0;
  for (let i = 0; i < 8; i++) {
    slot = await ethers.provider.getStorageAt(SolidityBasicsNFT.address, i);
    console.log(`Slot${i} : ${slot}`);
  }
  const tx = await SolidityBasicsNFT.mintNft();
  await tx.wait(1);
  console.log("After Minting ... ");
  slot = await ethers.provider.getStorageAt(SolidityBasicsNFT.address, 6);
  console.log(`Slot${6} : ${slot}`);
  slot = await ethers.provider.getStorageAt(SolidityBasicsNFT.address, 7);
  console.log(`Slot${7} : ${slot}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
