pragma solidity >=0.4.22;

contract simpleStore {
    //Constructor => Run when smc deploys
    //set the tokens
    //Read total Tokens

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //State variable
    string public name = "SharU Token";
    string public symbol = "SHA";

    uint256 public totalSupply;

    //_ at the beginning of local variables ==Solidity
    mapping(address => uint256) public balanceOf;

    //_owner map(_spender=>_value)
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;

        //allocate iniialSupply
    }

    //Transfer function

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        //Trigger the Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        //msg. sender will approve
        // allowance
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transferFrom

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        //require from has enough balance
        require(balanceOf[_from] >= _value);

        //require allowace is a big enoough
        require(allowance[_from][msg.sender] >= _value);
        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        //update the allowance
        allowance[_from][msg.sender] -= _value;
        //emit Transfer event
        emit Transfer(_from, _to, _value);
        //returns a boolean
        return true;
    }
}