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
    return deployer.deploy([MathLib, MarketContractRegistry]).then(function () {

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
          // deploy our collateral token "USD" - a fake stable coin for testing
          // return deployer.deploy(CollateralToken, "USD Stable", "USD", 1000000, 18).then(function () {

          // deploy and set up main factory to create MARKET Protocol smart contracts.
          return deployer.deploy(
            MarketContractFactory,
            MarketContractRegistry.address,
            MarketCollateralPool.address,
            {gas: 6200000}
          ).then(function (factory) {
            return MarketContractRegistry.deployed().then(function (marketContractRegistry) {
              // white list the factory
              return marketContractRegistry.addFactoryAddress(factory.address).then(function () {
                return factory
                  .deployMarketContractMPX(
                    'BTC_USD_04302019,LBTC,SBTC',
                    CollateralToken.address,
                    [30000000000000, 70000000000000, 10, 100000000, 25, 12, 1556668799],
                    'api.coincap.io/v2/rates/bitcoin',
                    'rateUsd',
                    {gas: 7000000}
                  );
              });
            });
          });
        });
      });
      // });
    });
  }
};
