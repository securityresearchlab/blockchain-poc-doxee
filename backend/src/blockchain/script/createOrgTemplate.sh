#!/bin/bash

# Create crypto material using cryptogen
if [ "$CRYPTO" == "cryptogen" ]; then
    which cryptogen
    if [ "$?" -ne 0 ]; then
        fatalln "cryptogen tool not found. exiting"
    fi
    infoln "Generating certificates using cryptogen tool"

    infoln "Creating ORGANIZATION_NAME_PLACEHOLDER Identities"

    set -x
    cryptogen generate --config=./organizations/cryptogen/generated/crypto-config-org-ORGANIZATION_NAME_PLACEHOLDER.yaml --output="organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
        fatalln "Failed to generate certificates..."
    fi

fi

# Create crypto material using Fabric CA
if [ "$CRYPTO" == "Certificate Authorities" ]; then
    infoln "Generating certificates using Fabric CA"
    ${CONTAINER_CLI_COMPOSE} -f compose/$COMPOSE_FILE_CA -f compose/$CONTAINER_CLI/${CONTAINER_CLI}-$COMPOSE_FILE_CA up -d 2>&1

    . organizations/fabric-ca/registerEnroll.sh

    while :
    do
        if [ ! -f "organizations/fabric-ca/generated/ORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem" ]; then
        sleep 1
        else
        break
        fi
    done

    infoln "Creating ORGANIZATION_NAME_PLACEHOLDER Identities"

    createORGANIZATION_NAME_PLACEHOLDER

fi

infoln "Generating CCP files for ORGANIZATION_NAME_PLACEHOLDER"
./organizations/ccp-generate.sh