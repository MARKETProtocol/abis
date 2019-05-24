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
const CollateralToken = artifacts.require(
  'InitialAllocationCollateralToken.sol'
);

module.exports = function (deployer, network) {
  if (network !== 'live') {
    const mpxKovanOracleAddress = '0xa9891a7004a0aac1e0fc7fc791dffede1375f210';
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

        return deployer.deploy(MarketToken).then(function () {

          // deploy the global collateral pool
          return deployer.deploy(
            MarketCollateralPool,
            MarketContractRegistry.address,
            MarketToken.address
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
                return marketContractRegistry.addFactoryAddress(factory.address).then(function () {
                  return factory
                    .deployMarketContractMPX(
                      [
                        web3.utils.asciiToHex('BTC_USD_COINCAP_1559347199_BETA', 32),
                        web3.utils.asciiToHex('LBTC', 32),
                        web3.utils.asciiToHex('SBTC', 32)
                      ],
                      CollateralToken.address,
                      [50000000000000, 120000000000000, 10, 1000, 25, 100, 1559347199],
                      'https://api.coincap.io/v2/rates/bitcoin',
                      'rateUsd',
                      {gas: 7000000}
                    );
                });
              });
            });
          });
        });
      });
    });
  }
};