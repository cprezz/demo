// var cors = require('cors');
App = {

    web3Provider: null,
    contracts: {},
    account: ' 0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 9000000,
    //token price is in wei

    init: function() {
        console.log("App initialized...")
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();

    },

    initContracts: function() {
        $.getJSON("../../build/contracts/simpleSend.json", function(simpleSend) {
            App.contracts.simpleSend = TruffleContract(simpleSend);
            App.contracts.simpleSend.setProvider(App.web3Provider);
            App.contracts.simpleSend.deployed().then(function(simpleSend) {
                console.log("SharU Token Sale Address: ", simpleSend.address);
            });
        }).done(function() {
            $.getJSON("../../build/contracts/simpleStore.json", function(simpleStore) {
                App.contracts.simpleStore = TruffleContract(simpleStore);
                App.contracts.simpleStore.setProvider(App.web3Provider);
                App.contracts.simpleStore.deployed().then(function(simpleStore) {
                    console.log("SharU Token Address: ", simpleStore.address);

                });
                return App.render();
            });

        });
    },

    //listening for events emitted from contracts

    listenForEvents: function() {

        App.contracts.simpleSend.deployed().then(function(instance) {
            instance.Sell({
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("Event Triggered", event);
                App.render();
            })
        })

    },

    render: function() {

        // if (App.loading) {
        //     return;
        // }
        // App.loading = true;
        // var loader = $('#loader');
        // var content = $('#content');

        // loader.show();
        // content.hide();

        //load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err == null) {
                console.log("account", account);
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);

            }
        })

        App.contracts.simpleSend.deployed().then(function(instance) {
            simpleSendInstance = instance;
            return simpleSendInstance.tokenPrice();
        }).then(function(tokenPrice) {
            console.log("tokenPrice: ", tokenPrice)
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return simpleSendInstance.tokenSold();
        }).then(function(tokensSold) {
            App.tokenSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            //Load token Contract

            App.contracts.simpleStore.deployed().then(function(instance) {
                simpleStoreInstance = instance;
                return simpleStoreInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.sharu-balance').html(balance.toNumber());
                //wait for Sell event


            })
        });
    },

    buyTokens: function() {
        // $('#content').hide();
        // $('#loader').show();
        var numberOfToken = $('#numberOfToken').val();
        App.contracts.simpleSend.deployed().then(function(instance) {
            return instance.buyTokens(numberOfToken, {
                from: App.account,
                value: numberOfToken * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log("Tokens Bought...")
            $('form').trigger('reset') //Reset Number of tokesn in form
                // $('#content').show();
                // $('#loader').hide();


        })
    }

}

$(function() {
    $(window).load(function() {
        // app.use(cors())
        App.init();
    })
});