pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract  DappTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address indexed _buyer,
        uint256 _amount
    );

    constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
        admin = msg.sender;
        // Token Contract
        tokenContract = _tokenContract;
        // Token Price
        tokenPrice = _tokenPrice;
    }

    // multiply
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy tokens
    // Payable function check first if value is authorized on balance sender tx
    // Returned error: sender doesn't have enough funds to send tx. The upfront cost is: 700134439500000000000 and the sender's account only has: 99144378699999999899
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        //  TypeError: Invalid type for argument in function call. Invalid
        //  implicit conversion from contract DappTokenSale to address requested.
        // require(tokenContract.balanceOf(this) >= _numberOfTokens);
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keep track  of tokensSold
        tokensSold += _numberOfTokens;
        // Trigger Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending Token DappTokenSale
    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        // Transfer remaining dapp token to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        selfdestruct(msg.sender);
    }
}