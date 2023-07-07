//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__NotOwner();
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();
error NftMarketplace__NotAvailable();
error NftMarketplace__NotEnoughNft();
error NftMarketplace__DontEnoughNft();
error NftMarketplace__NotAllowed();

contract NftMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 price;
        address seller;
        uint256 piece;
    }
    //----------------------------------------------------------------
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price,
        uint256 pieces
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 pieces
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 pieces
    );

    //-----------------------------------------------------------------------

    // NFT contract address => NFT TokenID => Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;
    mapping(address => bool) private artist;

    // Modifiers ---------------------------------------------------------

    modifier isArtist() {
        if (!artist[msg.sender]) {
            revert NftMarketplace__NotAllowed();
        }
        _;
    }

    constructor() {
        artist[msg.sender] = true;
    }

    //-------------------------------------------------------------------
    /////////////////////
    // Main Functions //
    /////////////////////

    /*
     * @notice Method for listing NFT
     * @param nftAddress Address of NFT contract
     * @param tokenId Token ID of NFT
     * @param price sale price for each item
     * @param piece sale pieces for each items
     */

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 piece
    ) external nonReentrant isArtist {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        // marketplace must be approved to list and sell nft
        IERC1155 nft = IERC1155(nftAddress);
        if (!nft.isApprovedForAll(msg.sender, address(this))) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        if (nft.balanceOf(msg.sender, tokenId) < piece) {
            revert NftMarketplace__NotEnoughNft();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender, piece);
        emit ItemListed(msg.sender, nftAddress, tokenId, price, piece);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId,
        uint256 _piece
    ) external payable nonReentrant {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (_piece > listedItem.piece) {
            revert NftMarketplace__NotAvailable();
        }
        if (msg.value < listedItem.price * _piece) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }
        s_proceeds[listedItem.seller] += ((msg.value * 9) / 10);
        s_listings[nftAddress][tokenId].piece -= _piece;

        IERC1155(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId,
            _piece,
            ""
        );
        emit ItemBought(
            msg.sender,
            nftAddress,
            tokenId,
            listedItem.price,
            _piece
        );
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId,
        uint256 _piece
    ) external {
        if (s_listings[nftAddress][tokenId].seller != msg.sender) {
            revert NftMarketplace__NotOwner();
        }
        if (s_listings[nftAddress][tokenId].piece < _piece) {
            revert NftMarketplace__DontEnoughNft();
        }
        s_listings[nftAddress][tokenId].piece -= _piece;
        emit ItemCanceled(msg.sender, nftAddress, tokenId, _piece);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        if (s_listings[nftAddress][tokenId].seller != msg.sender) {
            revert NftMarketplace__NotOwner();
        }
        s_listings[nftAddress][tokenId].price = newPrice;

        emit ItemListed(
            msg.sender,
            nftAddress,
            tokenId,
            newPrice,
            s_listings[nftAddress][tokenId].piece
        );
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    function register(address _artist) public onlyOwner {
        artist[_artist] = true;
    }

    function unRegister(address _artist) public onlyOwner {
        artist[_artist] = false;
    }

    //-------------------------------------------------------------------
    //////////////////////
    // Getter Functions //
    //////////////////////

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

    function getStorage(
        address nftAddress,
        uint256 tokenId
    ) public view returns (uint256) {
        return s_listings[nftAddress][tokenId].piece;
    }

    function isAnArtistRegistered(address _artist) public view returns (bool) {
        return artist[_artist];
    }
}
