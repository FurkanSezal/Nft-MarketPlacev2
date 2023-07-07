const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic Nft Unit tests", () => {
      let nftMarketplace, basicNft, deployer, customer;
      const PRICE = ethers.utils.parseEther("0.1");
      const PIECE = 1;
      const BUY_PIECE = 1;
      const TOKEN_ID = 0;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        //player = (await getNamedAccounts()).player;
        customer = (await ethers.getSigners())[1];

        await deployments.fixture(["all"]);

        nftMarketplace = await ethers.getContract("NftMarketplace");
        basicNft = await ethers.getContract("BasicNft");
        await basicNft.setApprovalForAll(nftMarketplace.address, true);
        const tx = await nftMarketplace.register(deployer);
        await tx.wait(1);
      });

      it("get the token uri", async () => {
        const tokenUri = await basicNft.uri(TOKEN_ID);
        const contractUri = await basicNft.contractURI();

        assert(tokenUri);
        assert(contractUri);
        /*     await expect(
          basicNft.safeTransferFrom(deployer, player.address, TOKEN_ID, 1, [])
        ).to.be.revertedWith(
          "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
        console.log((await basicNft.balanceOf(deployer, TOKEN_ID)).toString());
        await basicNft.setApprovalForAll(nftMarketplace.address, true); */
      });

      it("The owner/artist can transfer nfts", async () => {
        const tx = await basicNft.safeTransferFrom(
          deployer,
          customer.address,
          0,
          1,
          []
        );
        const balance = await basicNft.balanceOf(customer.address, 0);
        assert(balance == 1);
      });

      it("Not able to transfer rather then marketplace", async () => {
        const customer2 = (await ethers.getSigners())[2];

        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );

        const customerConnectedNftMarketplace =
          nftMarketplace.connect(customer);
        // lets buy
        const tx_buy = await customerConnectedNftMarketplace.buyItem(
          basicNft.address,
          TOKEN_ID,
          BUY_PIECE,
          { value: PRICE.mul(BUY_PIECE) }
        );

        await tx_buy.wait(1);
        const balance = await basicNft.balanceOf(customer.address, 0);
        //    console.log(balance.toString());
        await expect(
          basicNft
            .connect(customer)
            .safeTransferFrom(customer.address, customer2.address, 0, 1, [])
        ).to.be.revertedWith("You already use it!");
      });
    });
