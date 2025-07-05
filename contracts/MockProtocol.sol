// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MockProtocol {
    // APY in basis points (e.g. 500 = 5.00%)
    uint256 private apyBps;

    mapping(address => uint256) public balances;
    event APYUpdated(uint256 newApyBps);
    event Deposited(address indexed user, uint256 amount);

    constructor(uint256 initialApyBps) {
        apyBps = initialApyBps;
    }

    function setAPY(uint256 newApyBps) external {
        apyBps = newApyBps;
        emit APYUpdated(newApyBps);
    }

    function getAPY() external view returns (uint256) {
        return apyBps;
    }

    function deposit() external payable {
        require(msg.value > 0, "No ETH sent");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
}