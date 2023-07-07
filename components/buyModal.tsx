import { Input, Modal, useNotification, Information } from "@web3uikit/core";
import { useState, useRef, useEffect } from "react";
import { useContractWrite, useNetwork, useAccount } from "wagmi";

import nftAbi from "../constants/BasicNftAbi.json";

import marketPlaceAddress from "../constants/networkMapping.json";

import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import { ethers } from "ethers";

interface buyModalProps {
  isVisible: boolean;
  nftAddress: string;
  tokenId: string;
  pieces: string;
  price: string;
  onClose: () => void;
  description: string;
}

export default function BuyModal({
  nftAddress,
  tokenId,
  isVisible,
  onClose,
  pieces,
  price,
  description,
}: buyModalProps) {
  //const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("0");
  const piecess = useRef(0);
  const dispatch = useNotification();

  const { chain } = useNetwork();
  const { address } = useAccount();

  let chain_id: string = chain?.id;

  if (chain_id == undefined) {
    chain_id = "31337";
  }

  //@ts-ignore
  const marketplaceAddress = marketPlaceAddress[chain_id]["NftMarketplace"][0];

  const { data, isLoading, isSuccess, status, write } = useContractWrite({
    address: marketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "buyItem",
  });

  const handleUpdateListingSuccess = async () => {
    dispatch({
      type: "success",
      title: "Bought Successfully",
      message:
        "Bought Successfully - Due to network activity this might take a few mins",
      position: "topR",
    });
    onClose && onClose();
    // priceToUpdateListingWith.current = 0;
  };

  useEffect(() => {}, [address, piecess.current]);

  useEffect(() => {
    if (status == "success") {
      handleUpdateListingSuccess();
    }
  }, [status]);

  return (
    <div>
      <Modal
        isVisible={isVisible}
        onCancel={onClose}
        onCloseButtonPressed={onClose}
        title={"BuyNFT!"}
        onOk={() => {
          //console.log(piecess.current, price);
          const _value = parseInt(price) * piecess.current;

          // console.log(_value);
          // @ts-ignore
          write?.({
            args: [nftAddress, tokenId, piecess.current],
            value: BigInt(_value),
          });
        }}
      >
        <div className="p-2">
          <Information information={description} topic="NFT Description" />
        </div>
        <div className="p-2">
          <Input
            label="How many you want to buy?"
            name={"Avaliable" + pieces + "NFTs"}
            type="number"
            onChange={(event) => {
              //@ts-ignore
              piecess.current = event.target.value.toString();
            }}
          ></Input>
        </div>
      </Modal>
    </div>
  );
}
