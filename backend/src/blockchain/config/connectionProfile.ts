/**
 * Funciton to compose connection profile
 * @param memberId 
 * @param caEndpoint 
 * @param ordererEndpoint 
 * @param peerEndpoint 
 * @returns 
 */
export function composeConnectionProfile(memberId: string, caEndpoint: string, ordererEndpoint: string, peerEndpoint: string, tlsChainPemPath: string) {
    return {
        version: '1.0',
        organizations: {
            Org1: {
                mspid: memberId,
                certificateAuthorities: ['ca'],
                peers: ['peer'],
            },
        },
        certificateAuthorities: {
            ca: {
                url: `https://${caEndpoint}`,
                tlsCACerts: {path: tlsChainPemPath},
                caName: process.env.MEMBER_ID,
            },
        },
        orderers: {
            'orderer.com': {
                url: `grpcs://${ordererEndpoint}`,
                grpcOptions: {'ssl-target-name-override': ordererEndpoint.replace(/:.*$/, '')},
                tlsCACerts: {path: tlsChainPemPath},
            },
        },
        peers: {
            peer: {
                url: `grpcs://${peerEndpoint}`,
                grpcOptions: {'ssl-target-name-override': peerEndpoint.replace(/:.*$/, '')},
                tlsCACerts: {path: tlsChainPemPath},
            },
        },
        channels: {
            documents: {
                orderers: ['orderer.com'],
                peers: {
                    peer: {endorsingPeer: true, chaincodeQuery: true, ledgerQuery: true},
                },
            },
        },
    }
};