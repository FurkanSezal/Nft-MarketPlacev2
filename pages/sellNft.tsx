import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { Form, useNotification } from "@web3uikit/core";
import nftAbi from "../constants/BasicNftAbi.json";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import marketPlaceAddress from "../constants/networkMapping.json";
import {
  useNetwork,
  useAccount,
  usePublicClient,
  useWalletClient,
  useContractRead,
} from "wagmi";
import networkMappingNft from "../constants/networkMappingNft.json";
import { useEffect } from "react";
import SellerProceed from "../components/Seller";

export default function Home() {
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  let chain_id: string = chain?.id;

  if (chain_id == undefined) {
    chain_id = "31337";
  }

  //@ts-ignore
  const marketplaceAddress = marketPlaceAddress[chain_id]["NftMarketplace"][0];

  const { data: isArtist } = useContractRead({
    address: marketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "isAnArtistRegistered",
    args: [account],
  });

  const dispatch = useNotification();

  async function apporveAndList(data: any) {
    console.log("approving...");

    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = data.data[2].inputResult;
    const pieces = data.data[3].inputResult;
    const _price = price * 10 ** 18;

    const isApproved = await publicClient.readContract({
      address: nftAddress,
      abi: nftAbi,
      functionName: "isApprovedForAll",
      args: [account, marketplaceAddress],
    });

    if (!isApproved) {
      const tx = await walletClient.writeContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: "setApprovalForAll",
        account,
        args: [marketplaceAddress, true],
      });

      const tx_receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (tx_receipt.status == "success") {
        dispatch({
          type: "success",
          message: "Approved!",
          title: "Approved!",
          position: "topR",
        });
      } else {
        dispatch({
          type: "error",
          message: "Transaction failed!",
          title: "Failed!",
          position: "topR",
        });
      }
    } else {
      const tx = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "listItem",
        account,
        args: [nftAddress, tokenId, _price, pieces],
      });

      const tx_receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      if (tx_receipt.status == "success") {
        dispatch({
          type: "success",
          message: "ItemListed Successfully!",
          title: "ItemListed!",
          position: "topR",
        });
      } else {
        dispatch({
          type: "error",
          message: "Transaction failed!",
          title: "Failed!",
          position: "topR",
        });
      }
    }
  }
  useEffect(() => {}, [publicClient]);

  return (
    <div className={styles.container}>
      <div>
        <Header></Header>
      </div>
      <Form
        buttonConfig={{
          onClick: function noRefCheck() {},
          theme: "primary",
        }}
        onSubmit={apporveAndList}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "%50",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          { name: "price (in ETH)", type: "number", value: "", key: "price" },
          { name: "pieces", type: "number", value: "", key: "pieces" },
        ]}
        title="Sell your NFTs!"
        id="Main Form"
      />
      <div className="p-2">
        <div>{isArtist ? <SellerProceed></SellerProceed> : ""}</div>
      </div>
    </div>
  );
}
