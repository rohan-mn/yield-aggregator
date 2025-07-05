// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MockProtocol.sol";

contract Aggregator {
    MockProtocol public protoA;
    MockProtocol public protoB;

    event Routed(address protocol, address indexed user, uint256 amount);

    constructor(address _a, address _b) {
        protoA = MockProtocol(_a);
        protoB = MockProtocol(_b);
    }

    // Deposit whichever protocol has the higher APY
    function depositHighest() external payable {
        require(msg.value > 0, "Send ETH to deposit");
        uint256 a = protoA.getAPY();
        uint256 b = protoB.getAPY();
        if (a >= b) {
            protoA.deposit{value: msg.value}();
            emit Routed(address(protoA), msg.sender, msg.value);
        } else {
            protoB.deposit{value: msg.value}();
            emit Routed(address(protoB), msg.sender, msg.value);
        }
    }
}
