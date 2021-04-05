/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {documentLoader} = require('bedrock-jsonld-document-loader');
const {Ed25519Signature2020} = require('@digitalbazaar/ed25519-signature-2020');
const {validateOperation, runOperation} = require('webkms-switch');
const keystores = require('./keystores.js');
const BedrockKmsModuleManager = require('./BedrockKmsModuleManager.js');
const MongoDBKeyDescriptionStorage =
  require('./MongoDBKeyDescriptionStorage.js');
require('bedrock-did-context');
require('bedrock-veres-one-context');

const didIo = require('did-io');

// Config did-io to support did:key and did:v1 drivers
didIo.use('key', require('@digitalbazaar/did-method-key').driver());
// TODO: Move v1 'test' mode param to config.
didIo.use('v1', require('did-veres-one').driver({mode: 'test'}));

// load config defaults
require('./config');

const defaultModuleManager = new BedrockKmsModuleManager();
const defaultStorage = new MongoDBKeyDescriptionStorage();
const defaultDocumentLoader = async url => {
  let document;
  if(url.startsWith('did:')) {
    document = await didIo.get({did: url, forceConstruct: true});
    // FIXME
    if(url.startsWith('did:v1')) {
      document = document.doc;
    }
    return {
      contextUrl: null,
      documentUrl: url,
      document
    };
  }

  // finally, try the bedrock document loader
  return documentLoader(url);
};

exports.BedrockKmsModuleManager = BedrockKmsModuleManager;
exports.MongoDBKeyDescriptionStorage = MongoDBKeyDescriptionStorage;
exports.keystores = keystores;
exports.keyDescriptionStorage = defaultStorage;
exports.defaultDocumentLoader = defaultDocumentLoader;

exports.validateOperation = async ({
  url, method, headers, operation,
  expectedHost, expectedRootCapability,
  getInvokedCapability, inspectCapabilityChain,
  storage = defaultStorage,
  documentLoader = defaultDocumentLoader
}) => {
  return validateOperation({
    url, method, headers, operation, storage,
    getInvokedCapability, documentLoader, expectedHost, expectedRootCapability,
    // TODO: support RsaSignature2018 and other suites?
    inspectCapabilityChain, suite: [new Ed25519Signature2020()]
  });
};

exports.runOperation = async ({
  operation,
  storage = defaultStorage,
  moduleManager = defaultModuleManager,
  documentLoader = defaultDocumentLoader
}) => {
  return runOperation({operation, storage, moduleManager, documentLoader});
};

exports.defaultDocumentLoader = defaultDocumentLoader;

// expose for testing purposes
exports._caches = require('./caches');
