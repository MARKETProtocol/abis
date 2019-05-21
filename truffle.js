const HDWalletProvider = require("truffle-hdwallet-provider");
const privateKey = ""; // used for testnets only!

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    kovan: {
      provider: () => new HDWalletProvider(privateKey, "https://kovan.infura.io/v3/8e01b33727674833a42e0b1157f5ff9b"),
      //host: '127.0.0.1',
      //port: 8545,
      //from: '0x0088BD180722C48602770d355E692D2EBFbA86Ac',
      network_id: 42,
      gasPrice: 1000000000 // Specified in Wei
    }
  },
  compilers: {
    solc: {
      version: '0.5.2',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};


