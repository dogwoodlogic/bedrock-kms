/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const webkmsContext = require('webkms-context');
const aesContext = require('aes-key-wrapping-2019-context');
const hmacContext = require('sha256-hmac-key-2019-context');
const {cryptoLd} = require('./cryptoLd.js');

const {CONTEXT_URL: WEBKMS_CONTEXT_URL} = webkmsContext;
const {CONTEXT_URL: AES_2019_CONTEXT_URL} = aesContext;
const {CONTEXT_URL: HMAC_2019_CONTEXT_URL} = hmacContext;

const operations = exports.operations = {};

const symmetric = new Map([
  ['AesKeyWrappingKey2019', AES_2019_CONTEXT_URL],
  ['Sha256HmacKey2019', HMAC_2019_CONTEXT_URL]
]);

operations.generate = ({type}) => {
  let suiteContextUrl = symmetric.get(type);
  if(!suiteContextUrl) {
    ({SUITE_CONTEXT: suiteContextUrl} = cryptoLd.suites.get(type) || {});
    if(!suiteContextUrl) {
      throw new Error(`Unknown key type: "${type}".`);
    }
  }

  return {
    '@context': [WEBKMS_CONTEXT_URL, suiteContextUrl],
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
};

operations.sign = {
  '@context': WEBKMS_CONTEXT_URL,
  type: 'SignOperation',
  invocationTarget: '',
  verifyData: '',
  proof: {
    verificationMethod: 'https://example.com/bar'
  }
};

operations.verify = {
  '@context': WEBKMS_CONTEXT_URL,
  type: 'VerifyOperation',
  invocationTarget: '',
  verifyData: '',
  proof: {
    verificationMethod: 'https://example.com/bar'
  }
};
