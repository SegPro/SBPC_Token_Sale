const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = function (deployer) {
    deployer.deploy(DappToken, 1000000).then(function (){
        var tokenPrice = 1000000000000000; // in wei equal to 0.001 ether
        return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice)
    });

};
