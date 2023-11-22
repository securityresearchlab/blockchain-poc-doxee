const shim = require('fabric-shim');

const Chaincode = class {
  async Init(stub) {
    console.info('Chaincode initialization');
    // Define the private data collection configuration
    const collectionConfig = [
      {
        name: 'privateCollection',
        policy: 'OR ("Org1MSP.peer", "Org2MSP.peer")',
      },
    ];

    await stub.createCollection('_implicit_org_Org1MSP', JSON.stringify(collectionConfig));
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
      if (details.fcn === 'getAllPrivateData') {
        response = await this.getAllPrivateData(stub);
      } else {
        const item = JSON.parse(details.params);
        response = await method(stub, item);
      }

      return shim.success(response);
    } catch (err) {
      return shim.error(err);
    }
  }


  async put(stub, item) {
    const key = item.id;
    const buffer = Buffer.from(item.document);
    await stub.putState(key, buffer);
    const privateDataKey = stub.createCompositeKey('_implicit_org_Org1MSP', [key]);
    await stub.putPrivateData('_implicit_org_Org1MSP', 'privateCollection', privateDataKey, buffer);
  }

  async delete(stub, item) {
    const key = item.id;
    await stub.deleteState(key);
    const privateDataKey = stub.createCompositeKey('_implicit_org_Org1MSP', [key]);
    await stub.deletePrivateData('_implicit_org_Org1MSP', 'privateCollection', privateDataKey);
  }

  async getPrivateData(stub, item) {
    const key = item.id;
    const privateDataKey = stub.createCompositeKey('_implicit_org_Org1MSP', [key]);
    return stub.getPrivateData('_implicit_org_Org1MSP', 'privateCollection', privateDataKey);
  }

  async getAllPrivateData(stub) {
    const privateDataIterator = await stub.getPrivateDataByRange('_implicit_org_Org1MSP', '', '');
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

