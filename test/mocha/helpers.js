/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const {util: {clone, uuid}} = require('bedrock');

exports.generateKey = async ({mockData, type}) => {
  // create a keystore
  const mockKeystoreId = `https://example.com/keystore/${uuid()}`;
  await brKms.keystores.insert({config: {
    id: mockKeystoreId,
    controller: 'foo',
    sequence: 0,
  }});

  const keyId = `${mockKeystoreId}/keys/${uuid()}`;
  const operation = clone(mockData.operations.generate({type}));
  operation.kmsModule = 'ssm-v1';
  operation.invocationTarget.id = keyId;
  operation.invocationTarget.type = type;
  return brKms.runOperation({operation});
};
