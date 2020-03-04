const utils = require('./utils/general')
const safeUtils = require('./utils/execution')
//const { expectEvent } = require('openzeppelin-test-helpers');

const GnosisSafe = artifacts.require("./GnosisSafe.sol")
const ProxyFactory = artifacts.require("./ProxyFactory.sol")
const SafeBeacon = artifacts.require("./SafeBeacon.sol")

//require('chai').should()

contract('Beacon usage for signalling to new owners', function(accounts) {

    let gnosisSafe
    let gnosisSafeMasterCopy
    let beacon
    let lw
    let executor = accounts[8]

    const CALL = 0
    const CREATE = 2

    beforeEach(async function () {
        // Create lightwallet
        lw = await utils.createLightwallet()
        // Create Master Copies
        let proxyFactory = await ProxyFactory.new()
        gnosisSafeMasterCopy = await utils.deployContract("deploying Gnosis Safe Mastercopy", GnosisSafe)
        beacon = await SafeBeacon.new()
        // Create Gnosis Safe
        let gnosisSafeData = await gnosisSafeMasterCopy.contract.setupWithBeacon.getData([lw.accounts[0], lw.accounts[1], lw.accounts[2]], 2, 0, "0x", 0, 0, 0, 0, beacon.address)
        gnosisSafe = utils.getParamFromTxEvent(
            await proxyFactory.createProxy(gnosisSafeMasterCopy.address, gnosisSafeData),
            'ProxyCreation', 'proxy', proxyFactory.address, GnosisSafe, 'create Gnosis Safe Proxy',
        )
    })

    it('beacon address should be set', async () => {
        const beaconAddr = await gnosisSafe.getBeaconAddress();
        assert.equal(beaconAddr, beacon.address);
    })

    it('should add an owner and emit events', async () => {
        // Fund account for execution
        await web3.eth.sendTransaction({from: accounts[0], to: gnosisSafe.address, value: web3.toWei(0.1, 'ether')})

        let executorBalance = await web3.eth.getBalance(executor).toNumber()
        // Add owner and set threshold to 3
        assert.equal(await gnosisSafe.getThreshold(), 2)
        let data = await gnosisSafe.contract.addOwnerWithThreshold.getData(accounts[1], 3)
        let addTx = await safeUtils.executeTransaction(lw, gnosisSafe, 'add owner and set threshold to 3', [lw.accounts[0], lw.accounts[1]], gnosisSafe.address, 0, data, CALL, executor)
        assert.equal(utils.checkTxEvent(addTx, 'AddedOwner', gnosisSafe.address, true).args.owner, accounts[1])
        assert.equal(utils.checkTxEvent(addTx, 'ChangedThreshold', gnosisSafe.address, true).args.threshold.toNumber(), 3)

        // events of nested transactions are not included in the logs object.
        // This would do it, but seems to not go along well with the project setup
        // The dependency was removed from package.json
        // TODO
        //await expectEvent.inTransaction(addTx.tx, SafeBeacon, 'SafeUpdate', { safe: gnosisSafe.address })

        assert.deepEqual(await gnosisSafe.getOwners(), [accounts[1], lw.accounts[0], lw.accounts[1], lw.accounts[2]])
        assert.equal(await gnosisSafe.getThreshold(), 3)
    })
})