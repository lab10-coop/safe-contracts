var SafeBeacon = artifacts.require("./SafeBeacon.sol");

module.exports = function(deployer) {
    deployer.deploy(SafeBeacon);
};
