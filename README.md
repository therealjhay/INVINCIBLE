# Invincible Faucet (Viltrum / VIL)

A full-stack ERC-20 faucet project: a capped token contract with a 24-hour faucet, owner minting, and a React UI for claiming, transferring, and viewing stats.

**Idea -> Implementation (Project Story)**
The goal was to create a simple, friendly testnet token that feels \"real\" (capped supply, standard ERC-20 behavior) while still being easy to get through a faucet. From that idea, the implementation focused on three pillars:
1. **Predictable token economics**: a fixed max supply with a clear initial mint and a per-user faucet limit.
2. **Safe, standard ERC-20 behavior**: leverage OpenZeppelin's battle-tested ERC-20 and Ownable patterns.
3. **A pleasant UX**: a lightweight React interface to connect a wallet, claim faucet tokens, send tokens, and (for the owner) mint within limits.

**Contract & Token Addresses**
The token contract address is also the token address (standard ERC-20). The frontend is configured to use these values by default:

| Network | Chain ID | Contract Address | Token Address | Explorer |
| --- | --- | --- | --- | --- |
| Lisk Sepolia | `4202` | `0x6FA63Dc97FC20752B422AB24ee8F5d3Ce53836A5` | `0x6FA63Dc97FC20752B422AB24ee8F5d3Ce53836A5` | `https://sepolia-blockscout.lisk.com` |

If you deploy a new instance, update `VITE_CONTRACT_ADDRESS` (and optionally `VITE_CHAIN_ID`, `VITE_RPC_URL`) in the frontend env, or change the fallback in `frontend/src/abi/constants.ts`.

**Token Specs**
- Name: `Viltrum`
- Symbol: `VIL`
- Decimals: `18`
- Initial Supply: `1,000,000 VIL` (minted to deployer)
- Max Supply: `10,000,000 VIL`
- Faucet Amount: `100 VIL` per claim
- Cooldown: `24 hours` per address

**Smart Contract Design**
Key behaviors in `contracts/Viltrum.sol`:
- `requestToken()` - allows anyone to claim `100 VIL` if 24 hours have passed since their last claim.
- `requestToken()` - reverts with `COOLDOWN:<seconds>` when called too early (the UI parses this for feedback).
- `requestToken()` - stops minting once `MAX_SUPPLY` is reached.
- `mint(address to, uint256 amount)` - owner-only minting within the `MAX_SUPPLY` cap.
- Utility views: `cooldownRemaining`, `nextClaimTime`, `remainingMintable`.
- Built on OpenZeppelin `ERC20` + `Ownable`.

**Frontend UX**
The Vite + React UI (in `frontend/`) provides:
- Wallet connect / disconnect.
- Live token stats (total supply, remaining mintable, faucet amount, cooldown).
- Faucet claim button with cooldown status.
- Token transfer form.
- Owner-only mint panel (shown when the connected wallet is the owner).

**Project Structure**
- `contracts/` - Solidity contract(s).
- `scripts/deploy.ts` - deployment + optional Blockscout verification.
- `test/` - Hardhat + Chai tests.
- `frontend/` - React UI (Vite) + ABI + contract wiring.

**Local Setup**
1. Install root dependencies: `npm install`
2. Compile contracts: `npm run compile`
3. Run tests: `npm test`

**Run the Frontend**
1. Install UI deps: `cd frontend` then `npm install`
2. Start dev server: `npm run dev`

**Deployment**
- Local node + deploy: `npm run deploy:local`
- Lisk Sepolia deploy: `npm run deploy:lisk-sepolia`

The deploy script prints the deployed address and, on public networks, waits for 6 confirmations before attempting Blockscout verification.

**Environment Variables**
Root (`.env`) for Hardhat:
- `PRIVATE_KEY` - deployer key (keep this private).
- `LISK_SEPOLIA_RPC_URL` - Lisk Sepolia RPC endpoint.
- `LISK_BLOCKSCOUT_API_KEY` - for contract verification (Blockscout).
- `RPC_URL` - optional fallback RPC (also set to Lisk Sepolia here).

Frontend (`frontend/.env` or `frontend/.env.local`):
- `VITE_CONTRACT_ADDRESS` - contract/token address used by the UI.
- `VITE_CHAIN_ID` - expected chain ID (default `4202` for Lisk Sepolia).
- `VITE_RPC_URL` - read-only fallback RPC (defaults to `https://rpc.sepolia-api.lisk.com`).

**Testing Notes**
The tests in `test/Viltrum.test.ts` cover:
- Deployment and metadata.
- Faucet logic, cooldown enforcement, and events.
- Owner-only minting and max supply enforcement.
- Standard ERC-20 transfers and approvals.

**Security / Ops Notes**
- Never commit real private keys; use `.env` locally.
- This project is intended for testnet use and learning.

**Built with ❤️ by [jhay](https://github.com/therealjhay)**
