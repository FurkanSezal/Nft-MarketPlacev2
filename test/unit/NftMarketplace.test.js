const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("CryptoArtHub Unit tests", () => {
      let nftMarketplace, basicNft, deployer, customer;
      const PRICE = ethers.utils.parseEther("1");
      const PIECE = 10;
      const BUY_PIECE = 2;
      const CANCEL_PIECE = 2;
      const TOKEN_ID = 0;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        //customer = (await getNamedAccounts()).customer;
        customer = (await ethers.getSigners())[1];
        await deployments.fixture(["all"]);

        nftMarketplace = await ethers.getContract("NftMarketplace");
        basicNft = await ethers.getContract("BasicNft");

        // approve the marketplace

        await basicNft.setApprovalForAll(nftMarketplace.address, true);
        //
        //register our deployer as artist

        const tx = await nftMarketplace.register(deployer);
        await tx.wait(1);
      });

      it("list and can be bought", async () => {
        // listing time!
        const artistBalanceBeforeSell = await basicNft.balanceOf(
          deployer,
          TOKEN_ID
        );
        console.log("Before List and buy!");
        console.log("--------------------------------------");
        console.log(
          "Artist Balance: ",
          (await basicNft.balanceOf(deployer, TOKEN_ID)).toString()
        );
        console.log(
          "Customer Balance: ",
          (await basicNft.balanceOf(customer.address, TOKEN_ID)).toString()
        );
        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );
        expect(tx).to.emit(nftMarketplace, "ItemListed");

        // customer will buy the nft
        const customerConnectedNftMarketplace =
          nftMarketplace.connect(customer);
        // lets buy
        const tx_buy = await customerConnectedNftMarketplace.buyItem(
          basicNft.address,
          TOKEN_ID,
          BUY_PIECE,
          { value: PRICE.mul(BUY_PIECE) }
        );

        const newOwnerBalance = await basicNft.balanceOf(
          customer.address,
          TOKEN_ID
        );
        assert(newOwnerBalance.toString() == BUY_PIECE);

        assert(
          (await basicNft.balanceOf(deployer, TOKEN_ID)) ==
            artistBalanceBeforeSell - BUY_PIECE
        );
        console.log("--------------------------------------");
        console.log("After List and buy!");
        console.log("--------------------------------------");
        console.log(
          "Artist Balance: ",
          (await basicNft.balanceOf(deployer, TOKEN_ID)).toString()
        );
        console.log("Customer Balance: ", newOwnerBalance.toString());
        console.log("--------------------------------------");
        console.log(
          "Avaliable Nfts: ",
          (
            await nftMarketplace.getStorage(basicNft.address, TOKEN_ID)
          ).toString()
        );
        assert(
          (await nftMarketplace.getStorage(basicNft.address, TOKEN_ID)) ==
            PIECE - BUY_PIECE
        );

        expect(tx_buy).to.emit(nftMarketplace, "ItemBought");

        assert(
          ethers.utils.formatEther(
            await nftMarketplace.getProceeds(deployer)
          ) ==
            ethers.utils
              .formatEther(PRICE.mul(BUY_PIECE).mul(9).div(10))
              .toString()
        );

        console.log(
          "listing: ",
          (
            await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
          ).toString()
        );
      });

      it("list and cancel listing", async () => {
        // listing time!

        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );

        const afterListingCancel = await nftMarketplace.getListing(
          basicNft.address,
          TOKEN_ID
        );

        //console.log(afterListingCancel[2].toString());

        // lets cancel listing

        const tx_cancel = await nftMarketplace.cancelListing(
          basicNft.address,
          TOKEN_ID,
          PIECE
        );

        const beforeListingCancel = await nftMarketplace.getListing(
          basicNft.address,
          TOKEN_ID
        );

        // console.log(beforeListingCancel[2].toString());

        assert(0 == beforeListingCancel[2]);
      });

      it("list 10 and cancel 2", async () => {
        // listing time!

        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );

        const afterListingCancel = await nftMarketplace.getListing(
          basicNft.address,
          TOKEN_ID
        );

        // console.log(afterListingCancel[2].toString());

        // lets cancel listing

        const tx_cancel = await nftMarketplace.cancelListing(
          basicNft.address,
          TOKEN_ID,
          CANCEL_PIECE
        );

        const beforeListingCancel = await nftMarketplace.getListing(
          basicNft.address,
          TOKEN_ID
        );

        // console.log(beforeListingCancel[2].toString());

        assert(8 == beforeListingCancel[2]);

        // cant cancel more than user listed
        await expect(
          nftMarketplace.cancelListing(basicNft.address, TOKEN_ID, 20)
        ).to.be.revertedWith("NftMarketplace__DontEnoughNft");

        await expect(
          nftMarketplace
            .connect(customer)
            .cancelListing(basicNft.address, TOKEN_ID, CANCEL_PIECE)
        ).to.be.revertedWith("NftMarketplace__NotOwner");
      });

      it("Update to price", async () => {
        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );
        await tx.wait(1);

        const NEWPRICE = ethers.utils.parseEther("1");

        const update_price = await nftMarketplace.updateListing(
          basicNft.address,
          TOKEN_ID,
          NEWPRICE
        );
        expect(update_price).to.emit(nftMarketplace, "ItemListed");

        /* console.log(
          ethers.utils.formatEther(
            (await nftMarketplace.getListing(basicNft.address, TOKEN_ID))[0]
          )
        ); */

        assert(
          ethers.utils.formatEther(
            (await nftMarketplace.getListing(basicNft.address, TOKEN_ID))[0]
          ) == ethers.utils.formatEther(NEWPRICE)
        );
        await expect(
          nftMarketplace
            .connect(customer)
            .updateListing(basicNft.address, TOKEN_ID, NEWPRICE)
        ).to.be.revertedWith("NftMarketplace__NotOwner");
      });

      it("Artist withdraw their proceeds", async () => {
        // lets first list some nft
        // sell them make profit

        const tx = await nftMarketplace.listItem(
          basicNft.address,
          TOKEN_ID,
          PRICE,
          PIECE
        );
        await tx.wait(1);

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

        const balanceOfArtistBeforeSellNft =
          await customerConnectedNftMarketplace.provider.getBalance(deployer);

        console.log(
          "balanceOfArtistBeforeSellNft: ",
          ethers.utils.formatEther(balanceOfArtistBeforeSellNft).toString()
        );

        const proceeds = await customerConnectedNftMarketplace.getProceeds(
          deployer
        );

        // lets withdraw

        const tx_withdraw = await nftMarketplace
          .connect(await ethers.getSigner(deployer))
          .withdrawProceeds();

        const tx_receipt = await tx_withdraw.wait(1);

        const { gasUsed, effectiveGasPrice } = tx_receipt;
        const gasCost = gasUsed.mul(effectiveGasPrice);

        console.log("gasCost: ", ethers.utils.formatEther(gasCost).toString());

        const balanceOfArtistAfterSellNft =
          await nftMarketplace.provider.getBalance(deployer);

        console.log(
          "balanceOfArtistAfterSellNft: ",
          ethers.utils.formatEther(balanceOfArtistAfterSellNft).toString()
        );

        assert.equal(
          balanceOfArtistBeforeSellNft.add(proceeds).toString(),
          balanceOfArtistAfterSellNft.add(gasCost).toString()
        );
      });

      it("Only registered artist can list an nft", async () => {
        const tx = await nftMarketplace.unRegister(deployer);
        await tx.wait(1);
        await expect(
          nftMarketplace
            .connect(await ethers.getSigner(deployer))
            .listItem(basicNft.address, TOKEN_ID, PRICE, PIECE)
        ).to.be.revertedWith("NftMarketplace__NotAllowed");
      });

      it("Register as artist list nft", async () => {
        const newArtist = (await ethers.getSigners())[3];

        const tx = await nftMarketplace.register(newArtist.address);
        await tx.wait(1);

        const tx_transfer = await basicNft.safeTransferFrom(
          deployer,
          newArtist.address,
          TOKEN_ID,
          2,
          []
        );
        await tx_transfer.wait(1);

        /*  console.log(
          await nftMarketplace.isAnArtistRegistered(newArtist.address)
        ); */
        await nftMarketplace.isAnArtistRegistered(newArtist.address);
        // We registered lets list some item

        const tx_app = await basicNft
          .connect(newArtist)
          .setApprovalForAll(nftMarketplace.address, true);
        await tx_app.wait(1);

        const tx_list = await nftMarketplace
          .connect(newArtist)
          .listItem(basicNft.address, TOKEN_ID, PRICE, 1);

        assert(tx_list);
      });
    });
