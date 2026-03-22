// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Viltrum is ERC20, Ownable {
    // Constants 
    uint256 public constant MAX_SUPPLY    = 10_000_000 * 10 ** 18;
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;   // Faucet allows 100 tokens per claim
    uint256 public constant COOLDOWN      = 24 hours;

    //  State
    mapping(address => uint256) private _lastClaimed;

    //  Events 
    event TokensRequested(address indexed requester, uint256 amount, uint256 nextAvailableAt);
    event TokensMinted(address indexed to, uint256 amount);

    // Constructor
    constructor() ERC20("Viltrum", "VIL") Ownable() {
        // Mint an initial supply of 1,000,000 tokens to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    //  Public: Faucet 

    function requestToken() external {
        uint256 lastClaim     = _lastClaimed[msg.sender];
        uint256 nextAvailable = lastClaim + COOLDOWN;

        if (block.timestamp < nextAvailable) {
            uint256 remaining = nextAvailable - block.timestamp;
            revert(
                string(
                    abi.encodePacked(
                        "COOLDOWN:",
                        _toString(remaining)
                    )
                )
            );
        }

        require(
            totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY,
            "Viltrum: max supply reached"
        );

        _lastClaimed[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit TokensRequested(msg.sender, FAUCET_AMOUNT, block.timestamp + COOLDOWN);
    }

    // Owner-only: Mint 

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0),                      "Viltrum: mint to zero address");
        require(amount > 0,                            "Viltrum: amount must be > 0");
        require(totalSupply() + amount <= MAX_SUPPLY,  "Viltrum: exceeds max supply");

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // View Helpers

    function nextClaimTime(address user) external view returns (uint256) {
        uint256 next = _lastClaimed[user] + COOLDOWN;
        return block.timestamp >= next ? 0 : next;
    }

    function cooldownRemaining(address user) external view returns (uint256) {
        uint256 next = _lastClaimed[user] + COOLDOWN;
        return block.timestamp >= next ? 0 : next - block.timestamp;
    }

    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    // Internal Utility

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}