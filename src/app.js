App = {
    contracts : {},
    currentAccount : null,
    loading : false,

    init: function () {
        console.log("App initialized...")
        return App.initWeb3()
    },

    initWeb3: function () {
        // this returns the provider, or null if it wasn't detected
        detectProvider().then(function (){
            if (App.provider) {
                // If the provider returned by detectEthereumProvider is not the same as
                // window.ethereum, something is overwriting it, perhaps another wallet.
                if (App.provider !== window.ethereum) {
                    console.error('Do you have multiple wallets installed?');
                }else{
                    window.web3 = new Web3(App.provider);
                }
                // Access the decentralized web!
                console.log("Metamask detected");
                App.connect()
            } else {
                console.log('Please install MetaMask!');
            }
        })
    },

    connect: function (){
        ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(App.handleAccountsChanged)
            .catch((err) => {
                if (err.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    // If this happens, the user rejected the connection request.
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(err);
                }
            });
    },

    handleAccountsChanged: function (accounts){
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== App.currentAccount) {
            App.currentAccount = accounts[0];
            App.account =  App.currentAccount;
            $("#accountAddress").html("Your Account: " + App.account);
            // Do any other work!
            App.initContracts()
        }
    },

    initContracts : function () {
        $("#content").hide();
        $("#loader").show();
        $.getJSON("DappTokenSale.json", function (dappTokenSale) {
            getContract("DappTokenSale",dappTokenSale).then(function () {
                App.contracts.DappTokenSale.setProvider(App.provider);
                $.getJSON("DappToken.json", function (dappToken) {
                    getContract("DappToken", dappToken).then(function () {
                        App.contracts.DappToken.setProvider(App.provider);
                        getDappTokenSalePrice().then(function (dappTokenSalePrice){
                            App.tokenPrice = dappTokenSalePrice
                            $(".token-price").html(web3.utils.fromWei(App.tokenPrice, "ether"));
                        });
                        getDappTokenSaleBalance().then(function (dappTokenSaleBalance) {
                            App.tokensAvailable = dappTokenSaleBalance
                            getDappTokenSold().then(function (dappTokenSold) {
                                App.tokensSold = dappTokenSold
                                $(".tokens-sold").html(App.tokensSold);
                                initAmount = parseInt(App.tokensSold)+parseInt(App.tokensAvailable)
                                $(".tokens-available").html(initAmount);
                                progressPercent = (Math.ceil(App.tokensSold) / initAmount)*100;
                                $("#progress").css("width", progressPercent + "%");
                                if(initAmount > 0) {
                                    $("#start").hide();
                                    $("#content").show();
                                    $("#loader").hide();
                                }else{
                                    $("#start").show();
                                    $("#content").hide();
                                    $("#loader").hide();
                                }
                            })
                        })
                    })
                })
            })
        })
    },

    buyToken: function (){
        buy($("#numberOfTokens").val()).then(function () {
            App.initContracts()
            $("#numberOfTokens").val("1")
        })
    },

    purveySale: function() {
        purveyDappTokenSale().then(function (receipt){
            getDappTokenSaleBalance().then(function (dappTokenSaleBalance) {
                App.initContracts()
            })
        })
    }
}

async function buy(amount){
    buyNumber = await App.contracts.DappTokenSale.methods.buyTokens(amount).send({
        from: App.account,
        value: amount*App.tokenPrice,
        gas: 6721975
    });
    return buyNumber
}

async function getContract(tokenName, token){
    networkId = await web3.eth.net.getId()
    App.contracts[tokenName] = await new window.web3.eth.Contract(token.abi, token.networks[networkId.toString()].address);
}

async function detectProvider(){
    App.provider = await detectEthereumProvider()
}

async function getDappTokenSalePrice() {
    price = await App.contracts.DappTokenSale.methods.tokenPrice().call();
    return(price)
}

async function getDappTokenSold() {
    sold = await App.contracts.DappTokenSale.methods.tokensSold().call();
    return sold
}

async function getDappTokenSaleBalance() {
    balance = await App.contracts.DappToken.methods.balanceOf(App.contracts.DappTokenSale._address).call();
    return(balance)
}

async function purveyDappTokenSale() {
    receipt = await App.contracts.DappToken.methods.purvey(200000, App.contracts.DappTokenSale._address).send({
        from: App.currentAccount
    });
    return(receipt)
}

$(function () {
    $(window).on("load", function () {
        App.init();
    });
});