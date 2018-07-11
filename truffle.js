module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      host: '127.0.0.1',
      port: 8545,
      from: '0x8a6C7Ea2C27827093825e5FdD57BD564312c6a2c',
      network_id: 4,
      gasPrice: 3000000000 // Specified in Wei
    }
  }
};
