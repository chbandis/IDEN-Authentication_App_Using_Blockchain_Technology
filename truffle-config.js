const path = require("path");
require("dotenv").config({path: "./.env"});
const HDWalletProvider = require('@truffle/hdwallet-provider');
const accountIndex = 0;

module.exports = {
  networks: {  //Local Ganache Network
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1337" 
    },
    ropsten_infura: {   //Ropsten Test Network
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "wss://ropsten.infura.io/ws/v3/5350fdaf7eb2452092dd953cf61c5f78", accountIndex);
      },
      network_id: "3" 
    },
    rinkeby_infura: {   //Rinkeby Test Network
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/5350fdaf7eb2452092dd953cf61c5f78", accountIndex);
      },
      network_id: "4" 
    }
  },
  compilers: {
    solc: {
    version: "^0.8.13",
      settings: {
        optimizer: {
          runs: 200,
          enabled: true
        }
      }
    }
  }
};
