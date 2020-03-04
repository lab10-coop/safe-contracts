#!/usr/bin/env bash

# generates flattened versions of GnosisSafe and ProxyFactory

DEST=flat/
rm -r $DEST/*

./node_modules/.bin/poa-solidity-flattener "contracts/GnosisSafe.sol" $DEST
./node_modules/.bin/poa-solidity-flattener "contracts/proxies/ProxyFactory.sol" $DEST
