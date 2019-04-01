/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config: {constants}} = require('bedrock');
// const helpers = require('./helpers');

const operations = exports.operations = {};

operations.generate = {
  '@context': constants.SECURITY_CONTEXT_V1_URL,
  type: 'GenerateKeyOperation',
  invocationTarget: {
    id: '',
    type: '',
    controller: 'https://example.com/bar'
  },
  proof: {
    verificationMethod: 'https://example.com/bar'
  }
};

operations.sign = {
  '@context': constants.SECURITY_CONTEXT_V1_URL,
  type: 'SignOperation',
  invocationTarget: '',
  verifyData: '',
  proof: {
    verificationMethod: 'https://example.com/bar'
  }
};

operations.verify = {
  '@context': constants.SECURITY_CONTEXT_V1_URL,
  type: 'VerifyOperation',
  invocationTarget: '',
  verifyData: '',
  proof: {
    verificationMethod: 'https://example.com/bar'
  }
};
