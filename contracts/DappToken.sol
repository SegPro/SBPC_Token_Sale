pragma solidity >=0.4.22 <0.9.0;

contract  DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint256 public totalSupply;

    constructor () public {
        totalSupply = 1000000;
    }
    // SyntaxError: Functions are not allowed to have the same name as the contract.
    // If you intend this to be a constructor, use "constructor(...) { ... }" to define it. function DappToken () public {
//    function DappToken () public {
//        totalSupply = 1000000;
//    }
}