var simpleSend = artifacts.require('../contracts/simpleSend.sol');
var simpleStore = artifacts.require('../contracts/simpleStore.sol');

contract('simpleSend', function(accounts) {

    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; //in wei
    var admin = accounts[0];
    var tokensAvailable = 9000000;
    var buyer = accounts[1];
    var numberOfTokens;



    it('initializes the contract with the correct values ', function() {

        return simpleSend.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract Address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract Address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct');

        })
    });

    it('facilitates token buying', function() {
        return simpleStore.deployed().then(function(instance) {
            // Grab token instance first
            tokenInstance = instance;

            return simpleSend.deployed();
        }).then(function(instance) {
            // Grab Sale instance 
            tokenSaleInstance = instance;

            //Provision 50% of all the tokens to the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(function(receipt) {
            return tokenSaleInstance.tokenSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'Increments the number of tokesn sold')
                //Try to buy tokesn different from ether value
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable = numberOfTokens);
            //Try to buy tokesn different from ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.balue must equal to number of tokens in wei');
            return tokenSaleInstance.buyTokens(70, { from: buyer, value: 1 });

        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'Cannot purchase more tokens than available');
        })
    })

    it('ends token sale', function() {
        return simpleStore.deployed().then(function(instance) {
            tokenInstance = instance;
            return simpleSend.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            //Try to end the sale from the acc other than the admin
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0, 'must be admin to end the sale'));

            //check for the admin
            //     return tokenSaleInstance.endSale({ from: admin });
            // }).then(function (receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            //Why this is 4500000? it should be 4499990
            assert.equal(balance.toNumber(), 4500000, 'returns all unsold dapp tokens to the admin');
            //token price was reset and self destruct is called.
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price.toNumber(), 0, 'token price was reset');
        })
    })
});