#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function createOrgORGANIZATION_NAME_PLACEHOLDER {
	infoln "Enrolling the CA admin"
	mkdir -p ../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/

	export FABRIC_CA_CLIENT_HOME=${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca-orgORGANIZATION_NAME_PLACEHOLDER --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-orgORGANIZATION_NAME_PLACEHOLDER.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-orgORGANIZATION_NAME_PLACEHOLDER.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-orgORGANIZATION_NAME_PLACEHOLDER.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-orgORGANIZATION_NAME_PLACEHOLDER.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml"

	infoln "Registering peer0"
  set -x
	fabric-ca-client register --caname ca-orgORGANIZATION_NAME_PLACEHOLDER --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-orgORGANIZATION_NAME_PLACEHOLDER --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-orgORGANIZATION_NAME_PLACEHOLDER --id.name orgORGANIZATION_NAME_PLACEHOLDERadmin --id.secret orgORGANIZATION_NAME_PLACEHOLDERadminpw --id.type admin --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-orgORGANIZATION_NAME_PLACEHOLDER -M "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp" --csr.hosts peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml" "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-orgORGANIZATION_NAME_PLACEHOLDER -M "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls" --enrollment.profile tls --csr.hosts peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com --csr.hosts localhost --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null


  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/tlscacerts/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/ca.crt"
  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/signcerts/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/server.crt"
  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/keystore/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/server.key"

  mkdir "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/tlscacerts"
  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/tlscacerts/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/tlscacerts/ca.crt"

  mkdir "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/tlsca"
  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/tls/tlscacerts/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/tlsca/tlsca.orgORGANIZATION_NAME_PLACEHOLDER.example.com-cert.pem"

  mkdir "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/ca"
  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/peers/peer0.orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/cacerts/"* "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/ca/ca.orgORGANIZATION_NAME_PLACEHOLDER.example.com-cert.pem"

  infoln "Generating the user msp"
  set -x
	fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca-orgORGANIZATION_NAME_PLACEHOLDER -M "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/users/User1@orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml" "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/users/User1@orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
	fabric-ca-client enroll -u https://orgORGANIZATION_NAME_PLACEHOLDERadmin:orgORGANIZATION_NAME_PLACEHOLDERadminpw@localhost:11054 --caname ca-orgORGANIZATION_NAME_PLACEHOLDER -M "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/users/Admin@orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/orgORGANIZATION_NAME_PLACEHOLDER/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml" "${PWD}/../../../organizations/peerOrganizations/orgORGANIZATION_NAME_PLACEHOLDER.example.com/users/Admin@orgORGANIZATION_NAME_PLACEHOLDER.example.com/msp/config.yaml"
}
