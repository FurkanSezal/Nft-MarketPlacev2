// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicNft is ERC1155, ERC1155Burnable, Ownable {
    uint256 public constant ONION = 0;
    uint256 public constant POTATO = 1;
    address public marketplace;

    constructor(
        address _marketplace
    )
        ERC1155(
            "https://ipfs.io/ipfs/QmZe1dGgVAqQdQbgQXpEzWpmmdsRLUsPF61zubD2Y7m1tC/{id}.json"
        )
    {
        _mint(msg.sender, ONION, 10, "");
        _mint(msg.sender, POTATO, 5, "");
        marketplace = _marketplace;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        require(
            msg.sender == marketplace || msg.sender == owner(),
            "You already use it!"
        );
    }

    function uri(
        uint256 token_id
    ) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://ipfs.io/ipfs/QmZe1dGgVAqQdQbgQXpEzWpmmdsRLUsPF61zubD2Y7m1tC/",
                    Strings.toString(token_id),
                    ".json"
                )
            );
    }

    function contractURI() public pure returns (string memory) {
        return
            "https://ipfs.io/ipfs/QmZe1dGgVAqQdQbgQXpEzWpmmdsRLUsPF61zubD2Y7m1tC/collections.json";
    }
}
