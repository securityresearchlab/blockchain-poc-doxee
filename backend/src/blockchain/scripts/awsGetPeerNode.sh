#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsGetPeerNode.sh <network id> <node id>"
}

if [[ $# -lt 2 ]] ; then
    printHelp > /dev/null
    exit 0
fi

aws managedblockchain get-node --network-id $1 --node-id $2
