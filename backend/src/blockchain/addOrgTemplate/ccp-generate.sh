#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=3
P0PORT=11051
CAPORT=11054
PEERPEM=../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/tlsca/tlsca.orgORGANIZATION_NAME_PLACEHOLDER.example.com-cert.pem
CAPEM=../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/ca/ca.orgORGANIZATION_NAME_PLACEHOLDER.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/connection-orgORGANIZATION_NAME_PLACEHOLDER.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/connection-orgORGANIZATION_NAME_PLACEHOLDER.yaml
