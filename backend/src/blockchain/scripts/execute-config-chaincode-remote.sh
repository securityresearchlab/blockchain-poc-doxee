#!/bin/bash -e

ssh -i ${PWD}/src/blockchain/certs/blockchain_poc.pem centos@10.228.63.11 \
./configure-chaincode.sh $1 $2 $3 $4 $5 $6 
exit;