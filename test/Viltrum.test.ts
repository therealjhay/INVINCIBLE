import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Viltrum } from "../typechain-types";

describe("Viltrum", () => {
  let token: Viltrum;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const FAUCET_AMOUNT  = ethers.utils.parseEther("100");
  const MAX_SUPPLY     = ethers.utils.parseEther("10000000");
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  const ONE_DAY        = 24 * 60 * 60; // seconds

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Viltrum");
    token = (await Factory.deploy()) as Viltrum;
    await token.deployed();
  });

  // Deployment
  describe("Deployment", () => {
    it("sets correct name and symbol", async () => {
      expect(await token.name()).to.equal("Viltrum");
      expect(await token.symbol()).to.equal("VIL");
    });

    it("mints initial supply to owner", async () => {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("has correct MAX_SUPPLY constant", async () => {
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("has correct FAUCET_AMOUNT constant", async () => {
      expect(await token.FAUCET_AMOUNT()).to.equal(FAUCET_AMOUNT);
    });

    it("sets deployer as owner", async () => {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  // requestToken
  describe("requestToken()", () => {
    it("mints FAUCET_AMOUNT to the caller on first claim", async () => {
      const balBefore = await token.balanceOf(alice.address);
      await token.connect(alice).requestToken();
      expect(await token.balanceOf(alice.address)).to.equal(
        balBefore.add(FAUCET_AMOUNT)
      );
    });

    it("emits TokensRequested with correct values", async () => {
      const tx      = await token.connect(alice).requestToken();
      const receipt = await tx.wait();
      const block   = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(token, "TokensRequested")
        .withArgs(alice.address, FAUCET_AMOUNT, block.timestamp + ONE_DAY);
    });

    it("reverts with COOLDOWN:<seconds> when called within 24 hours", async () => {
      await token.connect(alice).requestToken();
      await expect(token.connect(alice).requestToken()).to.be.revertedWith(
        /^COOLDOWN:\d+$/
      );
    });

    it("allows a second claim after 24 hours have elapsed", async () => {
      await token.connect(alice).requestToken();

      await ethers.provider.send("evm_increaseTime", [ONE_DAY + 1]);
      await ethers.provider.send("evm_mine", []);

      const balBefore = await token.balanceOf(alice.address);
      await token.connect(alice).requestToken();
      expect(await token.balanceOf(alice.address)).to.equal(
        balBefore.add(FAUCET_AMOUNT)
      );
    });

    it("cooldown is per-user: alice claiming does not block bob", async () => {
      await token.connect(alice).requestToken();
      await expect(token.connect(bob).requestToken()).to.not.be.reverted;
    });

    it("cooldownRemaining() returns 0 before first claim", async () => {
      expect(await token.cooldownRemaining(alice.address)).to.equal(0);
    });

    it("cooldownRemaining() returns ~86400 immediately after claim", async () => {
      await token.connect(alice).requestToken();
      const remaining = await token.cooldownRemaining(alice.address);
      expect(remaining).to.be.closeTo(
        ethers.BigNumber.from(ONE_DAY),
        ethers.BigNumber.from(5) // 5s tolerance for block time variance
      );
    });

    it("nextClaimTime() returns 0 before first claim", async () => {
      expect(await token.nextClaimTime(alice.address)).to.equal(0);
    });

    it("nextClaimTime() returns a future timestamp after claim", async () => {
      const tx      = await token.connect(alice).requestToken();
      const receipt = await tx.wait();
      const block   = await ethers.provider.getBlock(receipt.blockNumber);
      expect(await token.nextClaimTime(alice.address)).to.equal(
        block.timestamp + ONE_DAY
      );
    });

    it("reverts when faucet would exceed MAX_SUPPLY", async () => {
      // Fill supply to within less than FAUCET_AMOUNT of cap
      const gap = MAX_SUPPLY
        .sub(await token.totalSupply())
        .sub(FAUCET_AMOUNT.sub(ethers.utils.parseEther("1")));
      await token.connect(owner).mint(alice.address, gap);

      await expect(token.connect(bob).requestToken()).to.be.revertedWith(
        "Viltrum: max supply reached"
      );
    });
  });

  // mint 
  describe("mint()", () => {
    it("allows owner to mint tokens to any address", async () => {
      const amount    = ethers.utils.parseEther("500");
      const balBefore = await token.balanceOf(alice.address);
      await token.connect(owner).mint(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(balBefore.add(amount));
    });

    it("emits TokensMinted event", async () => {
      const amount = ethers.utils.parseEther("500");
      await expect(token.connect(owner).mint(alice.address, amount))
        .to.emit(token, "TokensMinted")
        .withArgs(alice.address, amount);
    });

    it("reverts when called by non-owner", async () => {
      await expect(
        token.connect(alice).mint(alice.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("reverts when minting to zero address", async () => {
      await expect(
        token.connect(owner).mint(ethers.constants.AddressZero, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Viltrum: mint to zero address");
    });

    it("reverts when amount is 0", async () => {
      await expect(
        token.connect(owner).mint(alice.address, 0)
      ).to.be.revertedWith("Viltrum: amount must be > 0");
    });

    it("reverts when mint would exceed MAX_SUPPLY", async () => {
      const excess = MAX_SUPPLY
        .sub(await token.totalSupply())
        .add(ethers.utils.parseEther("1"));
      await expect(
        token.connect(owner).mint(alice.address, excess)
      ).to.be.revertedWith("Viltrum: exceeds max supply");
    });

    it("remainingMintable() decreases correctly after mint", async () => {
      const before = await token.remainingMintable();
      const amount = ethers.utils.parseEther("1000");
      await token.connect(owner).mint(alice.address, amount);
      expect((await token.remainingMintable())).to.equal(before.sub(amount));
    });
  });

  // Standard ERC20
  describe("ERC20 standard functions", () => {
    it("transfer() moves tokens between accounts", async () => {
      const amount = ethers.utils.parseEther("200");
      await token.connect(owner).transfer(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });

    it("approve() + transferFrom() work correctly", async () => {
      const amount = ethers.utils.parseEther("200");
      await token.connect(owner).approve(alice.address, amount);
      expect(await token.allowance(owner.address, alice.address)).to.equal(amount);
      await token.connect(alice).transferFrom(owner.address, bob.address, amount);
      expect(await token.balanceOf(bob.address)).to.equal(amount);
    });

    it("totalSupply() increases after requestToken", async () => {
      const before = await token.totalSupply();
      await token.connect(alice).requestToken();
      expect(await token.totalSupply()).to.equal(before.add(FAUCET_AMOUNT));
    });
  });
});
