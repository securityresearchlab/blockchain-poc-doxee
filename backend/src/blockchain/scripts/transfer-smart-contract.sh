#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  transfer-smart-contract.sh <smart contract name> <smart contract folder path>"
}

if [[ $# -lt 1 ]] ; then
    printHelp > /dev/null
    exit 0
fi

scp -i ${PWD}/src/blockchain/certs/blockchain_poc.pem $PWD/src/blockchain/scripts/configure-chaincode.sh centos@10.228.63.11:/home/centos/
scp -i ${PWD}/src/blockchain/certs/blockchain_poc.pem $2/* centos@10.228.63.11:/home/centos/chaincode/$1