var simpleStore = artifacts.require("../contracts/simpleStore.sol");
var simpleSend = artifacts.require("../contracts/simpleSend.sol");
//creating artifacts ==> creating a contract abstraction that truffle can use to run in JVEnv
//Or running clinetside applications

module.exports = function (deployer) {
    deployer.deploy(simpleStore, 9000000).then(function () {
        var tokenPrice = 1000000000000000;
        return deployer.deploy(simpleSend, simpleStore.address, tokenPrice);
    });

};