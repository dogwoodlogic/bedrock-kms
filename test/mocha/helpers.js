/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const {runOperation} = require('webkms-switch');
const {util: {clone, uuid}} = require('bedrock');

exports.generateKey = async ({mockData, type}) => {
  // create a keystore
  const mockKeystoreId = `https://example.com/keystore/${uuid()}`;
  const keystore = {
    id: mockKeystoreId,
    controller: 'foo',
    kmsModule: 'ssm-v1',
    sequence: 0,
  };
  await brKms.keystores.insert({config: keystore});

  const keyId = `${mockKeystoreId}/keys/${uuid()}`;
  const operation = clone(mockData.operations.generate({type}));
  operation.invocationTarget.id = keyId;
  operation.invocationTarget.type = type;
  const moduleManager = brKms.defaultModuleManager;
  return {
    keystore,
    keyDescription: await runOperation({operation, keystore, moduleManager})
  };
};
