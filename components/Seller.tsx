import {
  Input,
  Modal,
  useNotification,
  Information,
  Button,
} from "@web3uikit/core";
import { useState, useRef, useEffect } from "react";
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
import { formatUnits } from "viem";

interface SellerProceedProps {
  isVisible: boolean;
  nftAddress: string;
  tokenId: string;
  pieces: string;
  price: string;
  onClose: () => void;
}

export default function SellerProceed() {
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useNotification();

  let chain_id: string = chain?.id;

  if (chain_id == undefined) {
    chain_id = "31337";
  }

  //@ts-ignore
  const marketplaceAddress = marketPlaceAddress[chain_id]["NftMarketplace"][0];

  const { data: proceeds } = useContractRead({
    address: marketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "getProceeds",
    args: [account],
  });

  // console.log(proceeds);

  async function handleProceeds() {
    const tx = await walletClient.writeContract({
      address: marketplaceAddress,
      abi: nftMarketplaceAbi,
      functionName: "withdrawProceeds",
      account,
      args: [],
    });

    const tx_receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });
    if (tx_receipt.status == "success") {
      dispatch({
        type: "success",
        message: "Transaction Successfull!",
        title: "Successfull!",
        position: "topR",
      });
    } else {
      dispatch({
        type: "error",
        message: "Transaction Failed!",
        title: "Failed!",
        position: "topR",
      });
    }
  }

  useEffect(() => {}, []);

  return (
    <div>
      <div className="w-96">
        <Information
          information={proceeds ? formatUnits(proceeds, 18).toString() : "0"}
          topic="Your Avaliable Proceeds(ETH):"
        />
      </div>
      <div className="p-2">
        <Button
          onClick={handleProceeds}
          text="Get your Proceeds"
          theme="primary"
        />
      </div>
    </div>
  );
}
