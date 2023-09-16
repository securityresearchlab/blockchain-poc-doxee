#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  awsListProposals.sh <network id>"
}

if [[ $# -lt 1 ]] ; then
    printHelp > /dev/null
    exit 0
fi

# Local testing purposes
# echo "{
#     \"Proposals\": [
#         {
#             \"ProposalId\": \"p-AFHKEZXKF5GSXKFDR7UJC72YRI\",
#             \"ProposedByMemberId\": \"m-DFVMYZYCNZG5RJQXBWX2OY42BE\",
#             \"ProposedByMemberName\": \"DeveloperTestNet\",
#             \"Status\": \"IN_PROGRESS\",
#             \"CreationDate\": \"2023-09-15T08:33:54.692000+00:00\",
#             \"ExpirationDate\": \"2023-09-16T08:33:54.691000+00:00\",
#             \"Arn\": \"arn:aws:managedblockchain:us-east-1::proposals/p-KMHKEZXKF5GSXKFDR7UJC72YRI\"
#         },
#         {
#             \"ProposalId\": \"p-KMHKEZXKF5GSXKFDR7UJC72YRI\",
#             \"ProposedByMemberId\": \"m-DFVMYZYCNZG5RJQXBWX2OY42BE\",
#             \"ProposedByMemberName\": \"DeveloperTestNet\",
#             \"Status\": \"EXPIRED\",
#             \"CreationDate\": \"2023-09-13T08:33:54.692000+00:00\",
#             \"ExpirationDate\": \"2023-09-14T08:33:54.691000+00:00\",
#             \"Arn\": \"arn:aws:managedblockchain:us-east-1::proposals/p-KMHKEZXKF5GSXKFDR7UJC72YRI\"
#         },
#         {
#             \"ProposalId\": \"p-N2YDXBU2ZFEBTICT6P6TSKOAIE\",
#             \"ProposedByMemberId\": \"m-DFVMYZYCNZG5RJQXBWX2OY42BE\",
#             \"ProposedByMemberName\": \"DeveloperTestNet\",
#             \"Status\": \"EXPIRED\",
#             \"CreationDate\": \"2023-09-13T08:41:39.347000+00:00\",
#             \"ExpirationDate\": \"2023-09-14T08:41:39.347000+00:00\",
#             \"Arn\": \"arn:aws:managedblockchain:us-east-1::proposals/p-N2YDXBU2ZFEBTICT6P6TSKOAIE\"
#         },
#         {
#             \"ProposalId\": \"p-4MHLH74DFJBKFK7A2I6OVUSNQI\",
#             \"ProposedByMemberId\": \"m-DFVMYZYCNZG5RJQXBWX2OY42BE\",
#             \"ProposedByMemberName\": \"DeveloperTestNet\",
#             \"Status\": \"EXPIRED\",
#             \"CreationDate\": \"2023-09-14T09:29:06.104000+00:00\",
#             \"ExpirationDate\": \"2023-09-12T09:29:06.104000+00:00\",
#             \"Arn\": \"arn:aws:managedblockchain:us-east-1::proposals/p-4MHLH74DFJBKFK7A2I6OVUSNQI\"
#         }
#     ]
# }"

ssh -i ${PWD}/src/blockchain/scripts/certs/blockchain_poc.pem centos@10.228.63.11 \
aws managedblockchain list-proposals \
--network-id $1;\
exit;