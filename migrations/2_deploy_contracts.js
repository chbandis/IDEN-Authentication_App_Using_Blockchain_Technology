var Ownable = artifacts.require("./Ownable.sol");
var Issuer = artifacts.require("./Issuer.sol");
var Citizen = artifacts.require("./Citizen.sol");
var Verifier = artifacts.require("./Verifier.sol");

  module.exports = async function(deployer) {
    await deployer.deploy(Ownable);
    await deployer.deploy(Issuer);
      // .then(() => Issuer.deployed())
      // .then(_instance => deployer.deploy(Citizen, _instance.address));
    await deployer.deploy(Citizen);
    await deployer.deploy(Verifier);
   };
  