import { useEffect, useState } from "react";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import nftAbi from "../constants/BasicNftAbi.json";
import Image from "next/image";
import { Card, useNotification } from "@web3uikit/core";
import { ethers } from "ethers";
import {
  useContractRead,
  useAccount,
  useContractWrite,
  useNetwork,
} from "wagmi";
import UpdateListingModal from "./upgradeListingModal";
import marketPlaceAddress from "../constants/networkMapping.json";
import BuyModal from "./buyModal";

interface NftCardProps {
  price: string;
  nftAddress: string;
  tokenId: string;
  seller: string;
  pieces: string;
}

export default function NftCard({
  price,
  nftAddress,
  tokenId,
  seller,
  pieces,
}: NftCardProps) {
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const { address } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [buYModal, setShowBuyModal] = useState(false);
  const hideBuyModal = () => setShowBuyModal(false);
  const hideModel = () => setShowModal(false);
  const dispatch = useNotification();
  const [description, setDescription] = useState("");

  const tokenURI = useContractRead({
    //@ts-ignore
    address: nftAddress,
    abi: nftAbi,
    functionName: "uri",
    args: [tokenId],
  });

  async function uptadeUI() {
    if (tokenId) {
      //IPFS Gateway : A server that will return IPFS files from a "normal" URL

      //@ts-ignore
      const tokenURIResponse = await (await fetch(tokenURI.data)).json();
      console.log(tokenURIResponse.description);
      setDescription(tokenURIResponse.description);
      const imageURI = tokenURIResponse.image;
      /*  console.log("imageURIURL: ", imageURI);
      console.log("tokenURIResponse: ", tokenURIResponse); */
      setImageURI(imageURI);
      setTokenName(tokenURIResponse.name);
    }
  }

  const isOwnedByUser =
    seller === address?.toLowerCase() || seller === undefined;
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = () => {
    isOwnedByUser ? setShowModal(true) : setShowBuyModal(true);
  };

  useEffect(() => {
    uptadeUI();
  }, [tokenURI.data, address]);

  return (
    <div>
      <div className="flex flex-row">
        <div>
          <UpdateListingModal
            isVisible={showModal}
            tokenId={tokenId}
            nftAddress={nftAddress}
            onClose={hideModel}
          />
          <BuyModal
            isVisible={buYModal}
            tokenId={tokenId}
            nftAddress={nftAddress}
            onClose={hideBuyModal}
            pieces={pieces}
            price={price}
            description={description}
          ></BuyModal>

          <Card title={tokenName} onClick={handleCardClick}>
            <div className="p-2">
              <div className="flex flex-col items-end gap-2">
                <div>#{tokenId}</div>
                <div className="italic text-sm">
                  Owned by {formattedSellerAddress}
                </div>
                <Image
                  alt=""
                  loader={() => imageURI}
                  src={imageURI}
                  height="200"
                  width="200"
                />
                <div className="font-bold">{pieces} Available</div>
                <div className="font-bold">
                  {ethers.utils.formatUnits(price, "ether")} ETH
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr;

  const seperator = "...";
  const seperatorLenght = seperator.length;
  const charsToShow = strLen - seperatorLenght;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    seperator +
    fullStr.substring(fullStr.length - backChars)
  );
};
