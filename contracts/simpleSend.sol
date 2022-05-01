pragma solidity >=0.4.22;
import "./simpleStore.sol";

contract simpleSend {
    //admin is a state var
    address admin;
    //will give the address of token
    simpleStore public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(simpleStore _tokenContract, uint256 _tokenPrice) public {
        //Assign an admin

        //msg is the global var
        admin = msg.sender;
        //Assign Token Contract
        tokenContract = _tokenContract;
        //Set up the Token Price
        tokenPrice = _tokenPrice;
    }

    // Multiply functions

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        //Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        //Require that the contract has enough tokens

        //Something wrong with this one 4:19:25 msg.sender should be "this"
        //Also decrement or increment in numberofTokens in test file isn't affecting tests
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        //Require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //Keep track of numbers of token sold
        tokenSold += _numberOfTokens;
        //Emit Sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // ending SharUToken Sale

    function endSale() public {
        //Rwquire nly admin can do this

        require(msg.sender == admin);
        //transfer the remaining of tokesn back to admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

        //not working
        selfdestruct(msg.sender);
        // deploy contract
    }
}