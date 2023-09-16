#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsGenerateInvitation.sh <aws client id> <network id> <member id>"
}

if [[ $# -lt 3 ]] ; then
    printHelp > /dev/null
    exit 0
fi

# Local testing purposes
# echo "{
#     \"ProposalId\": \"p-AFHKEZXKF5GSXKFDR7UJC72YRI\"
# }"

ssh -i ${PWD}/src/blockchain/scripts/certs/blockchain_poc.pem centos@10.228.63.11 \
aws managedblockchain create-proposal \
--actions Invitations=[{Principal=$1}] \
--network-id $2 \
--member-id $3; \
exit;