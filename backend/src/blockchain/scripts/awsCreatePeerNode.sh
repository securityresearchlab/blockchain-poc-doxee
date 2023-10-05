#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsCreatePeerNode.sh <node configuration> <network id> <member id>"
}

if [[ $# -lt 3 ]] ; then
    printHelp > /dev/null
    exit 0
fi

aws managedblockchain create-node --node-configuration $1 --network-id $2 --member-id $3