#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsAcceptInvitationAndCreateMember.sh <network id> <invitation id> <member configuration string>"
}

if [[ $# -lt 3 ]] ; then
    printHelp > /dev/null
    exit 0
fi

# echo "{
#     \"MemberId\": \"m-J46DNSFRTVCCLONS9DT5TTLS2A\"
# }"

aws managedblockchain create-member --network-id $1 --invitation-id $2 --member-configuration $3