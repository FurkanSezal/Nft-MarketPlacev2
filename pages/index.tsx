import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_ITEMS from "../constants/subGraphQueryies";
import { ActiveItem } from "../dashone/generated/schema";
import NftCard from "../components/nftCard";
import Header from "../components/Header";

const Home: NextPage = () => {
  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);
  console.log("Active Items: ", listedNfts);

  return (
    <div>
      <Header></Header>
      <div>
        <Head>
          <title>CryptoArtHub Marketplace</title>
          <meta
            name="description"
            content="Buy and sell artwork on the CryptoArtHub Marketplace"
          />
        </Head>

        <main>
          <h1>Welcome to the CryptoArtHub Marketplace</h1>
          <p>Discover and trade unique digital artworks</p>
          {/* Add your marketplace content here */}
        </main>

        <div>
          {loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            <div className="flex flex-wrap">
              {listedNfts.activeItems.map((nft: ActiveItem) => {
                return (
                  <div className="flex flex-wrap">
                    <div className="flex-auto w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 p-2">
                      <div className="basis-1/4">
                        <NftCard
                          price={nft.price?.toString() ?? ""}
                          nftAddress={nft.nftAddress?.toString() ?? ""}
                          tokenId={nft.tokenId?.toString() ?? ""}
                          seller={nft.seller?.toString() ?? ""}
                          pieces={nft.pieces?.toString() ?? ""}
                          key={`${nft.nftAddress}${nft.tokenId}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer>
          <p>&copy; {new Date().getFullYear()} CryptoArtHub Marketplace</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
