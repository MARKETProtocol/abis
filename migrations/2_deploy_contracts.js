const MathLib = artifacts.require(
  '@marketprotocol/marketprotocol/MathLib.sol'
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
const CollateralToken = artifacts.require(
  '@marketprotocol/marketprotocol/InitialAllocationCollateralToken.sol'
);


module.exports = function (deployer, network) {
  if (network !== 'live') {
    return deployer.deploy([MathLib, MarketContractRegistry]).then(function () {

      deployer.link(
        MathLib,
        [
          MarketContractOraclize,
          MarketCollateralPool,
          MarketContractFactory,
          MarketContract
        ]
      );

      // deploy the global collateral pool
      return deployer.deploy(
        MarketCollateralPool,
        MarketContractRegistry.address
      ).then(function () {

        // deploy our collateral token "USD" - a fake stable coin for testing
        return deployer.deploy(CollateralToken, "USD Stable", "USD", 1000000, 18).then(function () {
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
              // deploy and set up main factory to create MARKET Protocol smart contracts.
              return deployer.deploy(
                MarketContractFactory,
                MarketContractRegistry.address,
                {gas: 7000000}
              ).then(function (factory) {
                // white list the factory
                return marketContractRegistry.addFactoryAddress(factory.address).then(function () {
                  // deploy our oracle hub
                  return deployer.deploy(
                    OracleHub,
                    factory.address,
                    {gas: gasLimit, from: web3.eth.accounts[0], value: 1e18}
                  ).then(function (oracleHub) {
                    return factory.setOracleHubAddress(oracleHub.address).then(function () {
                      // deploy the first market contract for testing purposes
                      return factory
                        .deployMarketContractOraclize(
                          'BTC_USDT_BIN_1548979199_BETA',
                          CollateralToken.address,
                          [150000000000, 600000000000, 8, 10000000000, 1548979199],
                          'URL',
                          'json(https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT).price',
                          {gas: 3000000}
                        );
                    });
                  });
                });
              });
            });
        });
      });
    });
  }
};
