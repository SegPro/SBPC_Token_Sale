var DappToken = artifacts.require("DappToken");
var DappTokenSale = artifacts.require("DappTokenSale");

contract("DappToken", function (accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];

    it("initialize the contract with the correct values", function (){
        return DappToken.deployed().then(function (instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name){
            assert.equal(name, "DApp Token", "has the correct name");
            return tokenInstance.symbol();
        }).then(function (symbol){
            assert.equal(symbol, "DAPP", "has the correct symbol");
            return tokenInstance.standard()
        }).then(function (standard){
            assert.equal(standard, "DApp Token v1.0", "has the correct standard");
        })
    })

    it("allocates the initial supply upon deployment", function (){
        return DappToken.deployed().then(function (instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, "sets the total supply to 1,000,000")
            return tokenInstance.balanceOf(admin);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, "it allocates the initial supply to the admin account")
        })
    })

    it("transfers token ownership", function () {
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            // Test 'require' statement first by transferring something largen than the sender's balance
            return tokenInstance.transfer.call(accounts[1], 1000001)
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return tokenInstance.transfer.call(accounts[1], 250000, {from: admin});
        }).then(function (success) {
            assert.equal(success, true, "it returns true");
            return tokenInstance.transfer(accounts[1], 250000, {from: admin})
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event");
            assert.equal(receipt.logs[0].args._from, admin, "logs the account the the tokens are transferred from");
            assert.equal(receipt.logs[0].args._to, accounts[1], "logs the account the the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 250000, "logs the transfer amount");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 250000, "adds the amount to the receiving account");
            return tokenInstance.balanceOf(admin);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 750000, "deducts the amount from the sending account");
        })
    })



    it("approves tokens for delegated transfer", function () {
        return DappToken.deployed().then(function (instance) {
           tokenInstance = instance;
           return tokenInstance.approve.call(accounts[1], 100, { from: admin});
        }).then(function (success) {
            assert.equal(success, true, "it returns true");
            return tokenInstance.approve(accounts[1], 100, { from: admin});
        }).then(function (receipt){
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Approval", "Should be the 'Approval' event");
            assert.equal(receipt.logs[0].args._owner, admin, "logs the account the the tokens are authorized by");
            assert.equal(receipt.logs[0].args._spender, accounts[1], "logs the account the the tokens are authorized to");
            assert.equal(receipt.logs[0].args._value, 100, "logs the transfer amount");
            return tokenInstance.allowance(admin, accounts[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated transfer");
        })
    });

    it("handles delegated token transfers", function () {
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAccount = admin;
            toAccount = accounts[1];
            spendingAccount = accounts[2];
            // Approve spendingAccount to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount, 1000000, {from: fromAccount});
        }).then(function (receipt) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 750001, {from: spendingAccount});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "cannot transfer value larger than balance");
            return tokenInstance.approve(spendingAccount, 100000, {from: fromAccount});
        }).then(function (receipt) {
            //Try transferring something larger than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 100001, { from: spendingAccount});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "cannot transfer value larger than approved amount");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 100000, {from: spendingAccount});
        }).then(function (success) {
            assert.equal(success, true, "it returns true");
            return tokenInstance.transferFrom(fromAccount, toAccount, 100000, {from: spendingAccount});
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event");
            assert.equal(receipt.logs[0].args._from, fromAccount, "logs the account the the tokens are transferred from");
            assert.equal(receipt.logs[0].args._to, toAccount, "logs the account the the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 100000, "logs the transfer amount");
            return tokenInstance.balanceOf(fromAccount);
        }).then(function (balance){
            assert.equal(balance.toNumber(), 650000, "deducts the amount from the sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function (balance){
            assert.equal(balance.toNumber(), 350000, "adds the amount from the receiving account");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 0, "deducts the amount from the allowance");
        })
    });

    it("purvey tokenSale", function () {
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return DappTokenSale.deployed().then(function (instance) {
                tokenSaleInstance = instance;
                // Try to purvey with an other account than admin
                return tokenInstance.purvey(250000, tokenSaleInstance.address, {from: accounts[1]});
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Only admin can purvey the tokenSaleContract");
                // Try transferring something larger than the sender's balance
                return tokenInstance.purvey(650001, tokenSaleInstance.address, {from: admin});
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "cannot transfer value larger than balance");
                return tokenInstance.purvey(500000, tokenSaleInstance.address, {from: admin});
            }).then(function (receipt) {
                assert.equal(receipt.logs.length, 1, "triggers one event");
                assert.equal(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event");
                assert.equal(receipt.logs[0].args._from, admin, "logs the account the the tokens are transferred from");
                assert.equal(receipt.logs[0].args._to, tokenSaleInstance.address, "logs the account the the tokens are transferred to");
                assert.equal(receipt.logs[0].args._value, 500000, "logs the transfer amount");
                return tokenInstance.balanceOf(admin)
            }).then(function (balance) {
                assert.equal(balance.toNumber(), 150000, "deducts the amount from the sending account");
                return tokenInstance.balanceOf(tokenSaleInstance.address)
            }).then(function (balance) {
                assert.equal(balance.toNumber(), 500000, "adds the amount from the receiving account");
                return tokenInstance.purvey.call(150000, tokenSaleInstance.address, {from: admin});
            }).then(function (success) {
                assert.equal(success, true, "it returns true");
            });
        });
    });
})