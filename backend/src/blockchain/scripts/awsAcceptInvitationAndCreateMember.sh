#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsAcceptInvitationAndCreateMember.sh <network id> <invitation id> <organization name> <description> <admin username> <admin password>"
}

if [[ $# -lt 3 ]] ; then
    printHelp > /dev/null
    exit 0
fi

echo "{
    \"MemberId\": \"m-J46DNSFRTVCCLONS9DT5TTLS2A\"
}"

# aws managedblockchain create-member \
# --network-id $1 \
# --invitation-id $2 \
# --member-configuration 'Name=$3,Description=$4,\
# FrameworkConfiguration={Fabric={AdminUsername=$5,\
# AdminPassword=$6}}'