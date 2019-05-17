/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const base58 = require('bs58');
const bedrock = require('bedrock');
const {util: {BedrockError}} = bedrock;
const {validateOperation, runOperation} = require('web-kms-switch');
const BedrockKmsModuleManager = require('./BedrockKmsModuleManager.js');
const MongoDBKeyDescriptionStorage =
  require('./MongoDBKeyDescriptionStorage.js');

// load config defaults
require('./config');

const defaultModuleManager = new BedrockKmsModuleManager();
const defaultStorage = new MongoDBKeyDescriptionStorage();
const defaultDocumentLoader = async url => {
  // TODO: move to did-key lib
  if(url.startsWith('did:key:')) {
    const publicKeyBase58 = _parsePublicKeyBase58(url);
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': 'https://w3id.org/security/v2',
        id: url,
        publicKey: [{
          id: url,
          // TODO: determine from parsing multibase key
          type: 'Ed25519VerificationKey2018',
          controller: url,
          publicKeyBase58
        }],
        authentication: [url],
        assertionMethod: [url],
        capabilityDelegation: [url],
        capabilityInvocation: [url]
      }
    };
  }
  const error = new Error(`Dereferencing url "${url}" is prohibited.`);
  error.name = 'NotAllowedError';
  error.httpStatusCode = 400;
  throw error;
};

exports.BedrockKmsModuleManager = BedrockKmsModuleManager;
exports.MongoDBKeyDescriptionStorage = MongoDBKeyDescriptionStorage;

exports.validateOperation = async ({operation}) => {
  try {
    await validateOperation({operation});
  } catch(e) {
    throw new BedrockError(
      'Validation Error', 'DataError', e, {
        httpStatusCode: 400,
        public: true
      });
  }
};

exports.runOperation = async ({
  operation,
  storage = defaultStorage,
  moduleManager = defaultModuleManager,
  documentLoader = defaultDocumentLoader
}) => {
  return await runOperation(
    {operation, storage, moduleManager, documentLoader});
};

exports.defaultDocumentLoader = defaultDocumentLoader;

function _parsePublicKeyBase58(didKeyUrl) {
  const fingerprint = didKeyUrl.substr('did:key:'.length);
  // skip leading `z` that indicates base58 encoding
  const buffer = base58.decode(fingerprint.substr(1));
  // assume buffer is: 0xed 0x01 <public key bytes>
  return base58.encode(buffer.slice(2));
}
