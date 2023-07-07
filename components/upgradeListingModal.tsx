import { Input, Modal, useNotification } from "@web3uikit/core";
import { useState, useRef, useEffect } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
  useAccount,
} from "wagmi";
import marketPlaceAddress from "../constants/networkMapping.json";

import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import { ethers } from "ethers";

interface UpdateListingModalProps {
  isVisible: boolean;
  nftAddress: string;
  tokenId: string;
  onClose: () => void;
}

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  onClose,
}: UpdateListingModalProps) {
  //const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("0");
  const priceToUpdateListingWith = useRef(0);
  const dispatch = useNotification();

  const { chain } = useNetwork();
  const { address } = useAccount();

  let chain_id: string = chain?.id;

  if (chain_id == undefined) {
    chain_id = "31337";
  }

  const marketplaceAddress = marketPlaceAddress[chain_id]["NftMarketplace"][0];

  const { data, isLoading, isSuccess, status, write } = useContractWrite({
    address: marketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "updateListing",
  });

  const handleUpdateListingSuccess = async () => {
    dispatch({
      type: "success",
      title: "listing updated",
      message:
        "Listing updated - Due to network activity this might take a few mins",
      position: "topR",
    });
    onClose && onClose();
    // priceToUpdateListingWith.current = 0;
  };

  useEffect(() => {}, [address, priceToUpdateListingWith.current]);

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
        onOk={() => {
          console.log(
            ethers.utils
              .parseUnits(priceToUpdateListingWith.current.toString(), "ether")
              .toString()
          );
          // @ts-ignore
          write?.({
            args: [
              nftAddress,
              tokenId,
              ethers.utils
                .parseUnits(
                  priceToUpdateListingWith.current.toString(),
                  "ether"
                )
                .toString(),
            ],
          });
        }}
      >
        <Input
          label="Update listing price in L1 Currency (ETH)"
          name="New Listing Price"
          type="number"
          value={""}
          onChange={(event) => {
            //@ts-ignore
            priceToUpdateListingWith.current = event.target.value.toString();
          }}
        ></Input>
      </Modal>
      {}
    </div>
  );
}
