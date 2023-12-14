const shim = require('fabric-shim');

const Chaincode = class {
  async Init(stub) {
    console.info('Chaincode initialization');
    // Define the private data collection configurations
    const collectionConfigOrg1Org2 = [
      {
        name: 'privateCollectionOrg1Org2',
        policy: 'OR ("Org1MSP.peer", "Org2MSP.peer")',
      },
    ];
    // Create the private data collections
    await stub.createCollection('_implicit_org_Org1MSP_Org2MSP', JSON.stringify(collectionConfigOrg1Org2));
    
    return shim.success();
  }

  async Invoke(stub) {
    const details = stub.getFunctionAndParameters();
    console.info(`Chaincode ${details.fcn} invoked: ${details.params}`);
    const method = this[details.fcn];

    if (!method) {
      throw new Error(`Chaincode function does not exist: ${details.fcn}`);
    }

    try {
      let response;
      const args = details.params.map(JSON.parse); // Parse all parameters as JSON

      if (details.fcn === 'getAllPrivateData') {
        // Pass the collection name from the parameters
        const collectionName = args[args.length - 1];
        response = await this.getAllPrivateData(stub, collectionName);
      } else {
        // Pass the collection name from the parameters
        const [item, collectionName] = args;
        response = await method(stub, item, collectionName);
      }

      return shim.success(response);
    } catch (err) {
      return shim.error(err);
    }
  }

  async put(stub, item, collectionName) {
    const key = item.id;
    const buffer = Buffer.from(item.document);

    // Put data in the specified private data collection
    await stub.putPrivateData('_implicit_org_Org1MSP_' + collectionName, key, buffer);
  }

  async delete(stub, item, collectionName) {
    const key = item.id;

    // Update the collection name in deletePrivateData
    await stub.deletePrivateData('_implicit_org_Org1MSP_' + collectionName, key);
  }

  async getPrivateData(stub, item, collectionName) {
    const key = item.id;

    // Get data from the specified private data collection
    return stub.getPrivateData('_implicit_org_Org1MSP_' + collectionName, key);
  }

  async getAllPrivateData(stub, collectionName) {
    const privateDataIterator = await stub.getPrivateDataByRange('_implicit_org_Org1MSP_' + collectionName, '', '');
    const allPrivateData = [];

    while (true) {
      const privateDataResult = await privateDataIterator.next();
      if (privateDataResult.value) {
        const key = privateDataResult.value.key;
        const value = privateDataResult.value.value.toString('utf8');
        allPrivateData.push({ key, value });
      }
      if (privateDataResult.done) {
        await privateDataIterator.close();
        break;
      }
    }
    return Buffer.from(JSON.stringify(allPrivateData));
  }
};

shim.start(new Chaincode());