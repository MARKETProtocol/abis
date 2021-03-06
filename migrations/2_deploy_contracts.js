const MathLib = artifacts.require(
  '@marketprotocol/marketprotocol/MathLib.sol'
);
const MarketContractMPX = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractMPX.sol'
);
const MarketContract = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContract.sol'
);
const MarketContractFactory = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractFactoryMPX.sol'
);
const MarketCollateralPool = artifacts.require(
  '@marketprotocol/marketprotocol/MarketCollateralPool.sol'
);
const MarketContractRegistry = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractRegistry.sol'
);
const MarketToken = artifacts.require(
  '@marketprotocol/marketprotocol/MarketToken.sol'
);

module.exports = function (deployer, network) {
  if (network.startsWith('mainnet')) {
    console.log("Deploying to mainnet", network)
    const mpxOracleAddress = '0x2acDbC24Cced44f55F59E52449731E388e5Bbeb2';
    return deployer.deploy(MathLib, {gas: 200000}).then(function () {
      return deployer.deploy(MarketContractRegistry, {gas: 1500000}).then(function () {

        deployer.link(
          MathLib,
          [
            MarketContractMPX,
            MarketCollateralPool,
            MarketContractFactory,
            MarketContract
          ]
        );
        return deployer.deploy(MarketToken, {gas: 2000000}).then(function () {
          // deploy the global collateral pool
          return deployer.deploy(
            MarketCollateralPool,
            MarketContractRegistry.address,
            MarketToken.address,
            {gas: 4000000}
          ).then(function () {
            // deploy and set up main factory to create MARKET Protocol smart contracts.
            return deployer.deploy(
              MarketContractFactory,
              MarketContractRegistry.address,
              MarketCollateralPool.address,
              mpxOracleAddress,
              {gas: 6000000}
            ).then(function (factory) {
              return MarketContractRegistry.deployed().then(function (marketContractRegistry) {
                // white list the factory
                return marketContractRegistry.addFactoryAddress(factory.address);
              });
            });
          });
        });
      });
    });
  } else {
    console.log("Deploying to kovan", network);
    const mpxKovanOracleAddress = '0xa9891a7004a0aac1e0fc7fc791dffede1375f210';
    const marketTokenAddress = '0xfc17745b9fBaA8214f35670E9F6AA764a3B8E688';
    return deployer.deploy(MathLib).then(function () {
      return deployer.deploy(MarketContractRegistry).then(function () {

        deployer.link(
          MathLib,
          [
            MarketContractMPX,
            MarketCollateralPool,
            MarketContractFactory,
            MarketContract
          ]
        );

        // deploy the global collateral pool
        return deployer.deploy(
          MarketCollateralPool,
          MarketContractRegistry.address,
          marketTokenAddress
        ).then(function () {
          // deploy and set up main factory to create MARKET Protocol smart contracts.
          return deployer.deploy(
            MarketContractFactory,
            MarketContractRegistry.address,
            MarketCollateralPool.address,
            mpxKovanOracleAddress,
            {gas: 6200000}
          ).then(function (factory) {
            return MarketContractRegistry.deployed().then(function (marketContractRegistry) {
              // white list the factory
              return marketContractRegistry.addFactoryAddress(factory.address);
            });
          });
        });
      });
    });
  }
};