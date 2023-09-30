#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsListMembers.sh <network id>"
}

if [[ $# -lt 1 ]] ; then
    printHelp > /dev/null
    exit 0
fi

aws managedblockchain list-members --network-id $1