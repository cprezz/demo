var simpleStore = artifacts.require('../contracts/simpleStore.sol');

contract('simpleStore', function(accounts) {
    var tokenInstance;

    it('initializes the contract with the correct values', function() {
        return simpleStore.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, "SharU Token", "Has the correct name")
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, "SHA", "has the right symbol")
        })
    })
    it('sets the total totalSupply upon deployment', function() {
        return simpleStore.deployed().then(function(instance) {

            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 9000000, 'Set value to 1 Million');

            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 9000000, 'It allocates the inital Supply to admin account')
        })

    });


    it('transfers token ownership', function() {
        return simpleStore.deployed().then(function(instance) {
            tokenInstance = instance;
            // Test `require` statement first by transferring something larger than the sender's balance
            return tokenInstance.transfer.call(accounts[1], 999999999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert') <= 0, 'error message must contain revert'); //Confused
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 8750000, 'deducts the amount from the sending account');
        });
    });

    //We are approving account 1 to spend 100 tokens on our behalf i.e ME = account0
    it('approves tokens for delegated transfer', function() {
        return simpleStore.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);

        }).then(function(allowance) {
            assert.equal(allowance, 100, 'store the allowance for delegated transfer');
        });
    });

    it('handles delegated token transfer', function() {

        return simpleStore.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendinAccount = accounts[4];

            //Transfer Some Tokens to fromAccount (100) becuase see above the tokens fro delegated transfer allowance
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(instance) {
            // Approve spendiAcc to spendd 10 tokens from fromAccount
            return tokenInstance.approve(spendinAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            // Try transferring something larger than the sender's balance
            // from: spendingAcc => Spending Account is calling below function
            //Sepnding Account is just a thrid party, doing nothing put approving and allowing; like a bank
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendinAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('reverrt') >= 0, 'cannot transfer value larger than balance'); //Confused >< .indexOf
            //Try transferring something larger than Approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendinAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('reverrt') <= 0, 'cannot transfer value larger than approved amount'); //Confused >< .indexOf
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendinAccount });

        }).then(function(success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendinAccount });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[2], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[3], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'deducts amount')
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'Adds the amount')
            return tokenInstance.allowance(fromAccount, spendinAccount);
        }).then(function(allowance) {
            assert.equal(allowance, 0, ' Spent the allowed tokens')
        })


    });

});