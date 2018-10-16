const MathLib = artifacts.require(
  '@marketprotocol/marketprotocol/MathLib.sol'
);
const OrderLib = artifacts.require(
  '@marketprotocol/marketprotocol/OrderLib.sol'
);
const MarketContractOraclize = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractOraclize.sol'
);
const MarketContractFactory = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractFactoryOraclize.sol'
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
const MarketTradingHub = artifacts.require(
  '@marketprotocol/marketprotocol/MarketTradingHub.sol'
);

module.exports = function (deployer, network) {
  if (network !== 'live') {
    return deployer.deploy([MathLib, OrderLib, MarketContractRegistry]).then(function () {

      deployer.link(
        MathLib,
        [
          MarketContractOraclize,
          MarketCollateralPool,
          MarketContractFactory
        ]
      );

      deployer.link(OrderLib, [MarketContractFactory, MarketContractOraclize, MarketTradingHub]);

      // deploy the global collateral pool
      return deployer.deploy(MarketCollateralPool).then(function (marketCollateralPool) {

        // deploy MKT token
        const marketTokenToLockForTrading = 0; // for testing purposes, require no lock
        const marketTokenAmountForContractCreation = 0; //for testing purposes require no balance
        return deployer
          .deploy(
            MarketToken,
            marketTokenToLockForTrading,
            marketTokenAmountForContractCreation
          )
          .then(function () {
            // deploy our trading hub!
            return deployer.deploy(
              MarketTradingHub,
              MarketToken.address,
              MarketCollateralPool.address
            ).then(function (marketTradingHub) {
              return marketCollateralPool.setMarketTradingHubAddress(
                marketTradingHub.address
              ).then(function () {
                // deploy and set up main factory to create MARKET Protocol smart contracts.
                return MarketContractRegistry.deployed().then(function (
                  marketContractRegistry
                ) {
                  return deployer.deploy(
                    MarketContractFactory,
                    marketContractRegistry.address,
                    MarketToken.address,
                    {
                      gas: 7000000
                    }
                  ).then(function (factory) {
                      // white list the factory
                      return marketContractRegistry.addFactoryAddress(factory.address)
                  });
                });
              });
            });
          });
      });
    });
  }
};
