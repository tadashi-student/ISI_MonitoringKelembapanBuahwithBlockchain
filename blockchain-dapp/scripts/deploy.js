const hre = require("hardhat");

async function main() {
  // Skrip ini akan mencari contract dengan nama "Monitoring" dan mendeploy-nya.
  const monitoringContract = await hre.ethers.deployContract("Monitoring");

  await monitoringContract.waitForDeployment();

  // Saya tambahkan "(versi baru)" di pesan log agar lebih jelas
  console.log(
    `Smart contract Monitoring (versi baru) di-deploy ke alamat: ${monitoringContract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});