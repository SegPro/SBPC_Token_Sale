pragma solidity >=0.4.22 <0.9.0;

contract  DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint256 public totalSupply;

    address internal admin;

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

    // approve
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    // allowance
    // I I'm account A and I want to approve accout B to spent value token
    mapping(address => mapping(address => uint256)) public allowance;

    // use _ before argument it is a convention in solidity
    constructor (uint256 _initialSupply) public {
        admin = msg.sender;
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

    function purvey(uint256 _numberOfTokens, address _to) public returns (bool success){
        require(msg.sender == admin);
        // Exception if account doesn't have enough
        require(balanceOf[msg.sender] >= _numberOfTokens);
        // Transfer the balance
        balanceOf[msg.sender] -= _numberOfTokens;
        balanceOf[_to] += _numberOfTokens;
        emit Transfer(msg.sender, _to, _numberOfTokens);
        // Return a boolean
        return true;
    }

    // Delegated Transfer

    // approve
    // spender is the address on the exchange which want to sent value
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // allowance
        allowance[msg.sender][_spender] = _value;
        // Approve event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        // Change the balanceOf
        balanceOf[_from]-= _value;
        balanceOf[_to]+= _value;
        // Update the allowance
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);
        // return a boolean
        return true;
    }
}