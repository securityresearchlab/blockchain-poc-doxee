#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsGenerateInvitation.sh <aws client id> <network id> <member id>"
}

if [[ $# -lt 3 ]] ; then
    printHelp > /dev/null
    exit 0
fi

echo "{
    \"ProposalId\": \"p-8MHLH74DFJBKFK7A2I6OVUSNQI\"
}"

# aws managedblockchain create-proposal \
# --actions Invitations=[{Principal=$1}] \
# --network-id $2 \
# --member-id $3