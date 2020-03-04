pragma solidity >=0.5.0 <0.7.0;

interface IBeacon {
    function update(address account, address safe, uint256 mode) external;
}