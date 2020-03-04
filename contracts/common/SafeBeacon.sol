pragma solidity >=0.5.0 <0.7.0;

import "../interfaces/IBeacon.sol";

/**
* stolen from https://github.com/austintgriffith/burner-wallet/blob/master/contracts/SafeBeacon/SafeBeacon.sol
* Allows clients to subscribe to a single contract for updates.
*/
contract SafeBeacon is IBeacon {
    address owner;

    function update(address account, address safe, uint256 mode) public {
        emit SafeUpdate(account, safe, mode, msg.sender);
    }

    /// Clients reading such events should check the sender, because anybody is allowed to emit those
    event SafeUpdate(address indexed account, address indexed safe, uint256 mode, address sender);
}