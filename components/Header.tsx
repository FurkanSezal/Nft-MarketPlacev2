import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h1 className="py-4 px-4 front-bold text-3xl">
        CryptoArtHub Marketplace
      </h1>
      <Link href="/">
        <p className="mr-4 p-6">Home</p>
      </Link>
      <Link href="/sellNft">
        <p>Sell NFT</p>
      </Link>
      <div className="flex flex-row items-center">
        <ConnectButton />
      </div>
    </nav>
  );
}
