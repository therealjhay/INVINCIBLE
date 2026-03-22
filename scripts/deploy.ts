import { ethers, run, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

  const Factory = await ethers.getContractFactory("Viltrum");
  const token   = await Factory.deploy();
  await token.deployed();

  console.log(`✅ Viltrum deployed to: ${token.address}`);
  console.log(`   Network: ${network.name}`);

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting 6 block confirmations before verifying...");
    await token.deployTransaction.wait(6);

    try {
      await run("verify:verify", {
        address: token.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Already Verified")) {
        console.log("ℹ️  Already verified");
      } else {
        console.error("Verification failed:", message);
      }
    }
  }

  console.log("\n─── Post-deploy info ───────────────────────────────");
  console.log(`   Name:           ${await token.name()}`);
  console.log(`   Symbol:         ${await token.symbol()}`);
  console.log(`   Total Supply:   ${ethers.utils.formatEther(await token.totalSupply())} VIL`);
  console.log(`   Max Supply:     ${ethers.utils.formatEther(await token.MAX_SUPPLY())} VIL`);
  console.log(`   Faucet Amount:  ${ethers.utils.formatEther(await token.FAUCET_AMOUNT())} VIL`);
  console.log(`   Cooldown:       ${(await token.COOLDOWN()).toNumber() / 3600}h`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
