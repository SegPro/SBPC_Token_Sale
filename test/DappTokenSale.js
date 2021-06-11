var DappTokenSale = artifacts.require("DappTokenSale");
var DappToken = artifacts.require("DappToken");

contract("DappTokenSale", function (accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; // in wei equal to 0.001 ether
    var buyer = accounts[1]
    var admin = accounts[0];
    var numberOfTokens;

    it("initalizes the contract with the correct values", function () {
        return DappTokenSale.deployed().then(function (instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function (address) {
            assert.notEqual(address, 0x0, "has contract address");
            return tokenSaleInstance.tokenContract();
        }).then(function (address) {
            assert.notEqual(address, 0x0, "has token contract address");
            return tokenSaleInstance.tokenPrice();
        }).then(function (price) {
            assert.equal(price, tokenPrice, "token price is correct")
        })
    });

    it("facilitates token buying", function () {
        return DappToken.deployed().then(function (instance) {
            // Grab token instance first
            tokenInstance = instance;
            return DappTokenSale.deployed().then(function (instance) {
                // Then grab token sale instance
                tokenSaleInstance = instance
                // Provision percent of all tokens to the token sale
                return tokenInstance.purvey(30000, tokenSaleInstance.address, {from: admin});
            }).then(function (receipt) {
                return tokenSaleInstance.buyTokens(30001, {from: buyer, value: 30001 * tokenPrice})
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "cannot purchase more tokens than available");
                // Try to buy tokens different from the ether value
                return tokenSaleInstance.buyTokens(10000, {from: buyer, value: 1});
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "msg.value must equal to number of tokens in wei");
                return tokenSaleInstance.buyTokens(10000, {from: buyer, value: 10000 * tokenPrice})
            }).then(function (receipt) {
                assert.equal(receipt.logs.length, 2, "triggers one event");
                assert.equal(receipt.logs[1].event, "Sell", "Should be the 'Sell' event");
                assert.equal(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event from purvey");
                assert.equal(receipt.logs[1].args._buyer, buyer, "logs the account that purchases the tokens");
                assert.equal(receipt.logs[1].args._amount, 10000, "logs the number of tokens purchased");
            }).then(function (receipt) {
                return tokenInstance.balanceOf(tokenSaleInstance.address);
            }).then(function (balance) {
                assert.equal(balance.toNumber(), 20000);
                return tokenInstance.balanceOf(buyer);
            }).then(function (balance) {
                assert.equal(balance.toNumber(), 10000);
                return tokenSaleInstance.tokensSold();
            }).then(function (amount) {
                assert.equal(amount.toNumber(), 10000, "increments the number of tokens sold")
            })
        })
    });

    it("end token sale", function () {
        return DappToken.deployed().then(function (instance) {
            // Grab token instance first
            tokenInstance = instance;
            return DappTokenSale.deployed().then(function (instance) {
                // Then grab token sale instance
                tokenSaleInstance = instance;
                // Try to end sale from account other than the admin
                return tokenSaleInstance.endSale({ from: buyer});
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "must be admin to end sale");
                // End sale as admin
                return tokenSaleInstance.endSale({ from: admin});
            }).then(function (receipt) {
                // receipt
                return tokenInstance.balanceOf(admin);
            }).then(function (balance){
                assert.equal(balance.toNumber(), 990000, "returns all unsold dapp tokens to admin")
                // Check that token proce was reset when selfDestruct was called
            })
        })
    });
});