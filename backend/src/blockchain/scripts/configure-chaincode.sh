#!/bin/bash -e

function printHelp() {
    echo "Usage: "
    echo "  configure-chaincode.sh <chaincode name> <network id> <member id> <node id> <orderer endpoint> <peer endpoint>"
}

if [[ $# -lt 6 ]] ; then
    printHelp > /dev/null
    exit 0
fi

# cd "$(dirname ${BASH_SOURCE[0]})/.."

export LEDGER_STACK="LedgerStack"

export CHAINCODE_NAME=$1
export NETWORK_ID=$2
export MEMBER_ID=$3
export NODE_ID=$4
export ORDERER_ENDPOINT=$5
export PEER_ENDPOINT=$6

export CHANNEL_NAME="mychannel"
export FABRIC_TOOLS_IMAGE="hyperledger/fabric-tools:2.2.3"

export CHAINCODE_VERSION="${1-v1}"
echo "Installing chaincode $CHAINCODE_NAME $CHAINCODE_VERSION"
export CHAINCODE_DIR="$HOME/chaincode/$CHAINCODE_NAME"
# cp -R "chaincode" "$HOME/"
docker run -v "$HOME:/opt/home" \
    -e "CORE_PEER_TLS_ENABLED=true" \
    -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_MSPCONFIGPATH=/opt/home/admin-msp" \
    -e "CORE_PEER_ADDRESS=$PEER_ENDPOINT" \
    -e "CORE_PEER_LOCALMSPID=$MEMBER_ID" \
    $FABRIC_TOOLS_IMAGE peer chaincode install -l node -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -p "/opt/home/chaincode/$CHAINCODE_NAME"


if [[ $CHAINCODE_VERSION == "v1" ]]; then
  echo "Instantiating chaincode $CHAINCODE_NAME $CHAINCODE_VERSION"
  export CHAINCODE_COMMAND="instantiate"
else
  echo "Upgrading chaincode $CHAINCODE_NAME to $CHAINCODE_VERSION"
  export CHAINCODE_COMMAND="upgrade"
fi
docker run -v "$HOME:/opt/home" \
    -e "CORE_PEER_TLS_ENABLED=true" \
    -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_MSPCONFIGPATH=/opt/home/admin-msp" \
    -e "CORE_PEER_ADDRESS=$PEER_ENDPOINT" \
    -e "CORE_PEER_LOCALMSPID=$MEMBER_ID" \
    $FABRIC_TOOLS_IMAGE peer chaincode $CHAINCODE_COMMAND -o $ORDERER_ENDPOINT -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c '{"Args":["init"]}' --cafile /opt/home/managedblockchain-tls-chain.pem --tls


echo "Chaincode configuration completed successfully"



