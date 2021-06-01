pragma solidity >=0.4.22 <0.9.0;

contract  DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint256 public totalSupply;

    // Name
    string public name = "DApp Token";
    // Symbol
    string public symbol = "DAPP";
    // Standard
    string public standard = "DApp Token v1.0";

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    // use _ before argument it is a convention in solidity
    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate the initial supply
    }
    // SyntaxError: Functions are not allowed to have the same name as the contract.
    // If you intend this to be a constructor, use "constructor(...) { ... }" to define it. function DappToken () public {
//    function DappToken () public {
//        totalSupply = 1000000;
//    }

    // Transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesn't have enough
        require(balanceOf[msg.sender] >= _value);
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // Transfert Event
        // This is an error : TypeError: Event invocations have to be prefixed by "emit".
        //Transfer(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        // Return a boolean
        return true;

    }
}