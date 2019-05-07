/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

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

exports.BedrockKmsModuleManager = BedrockKmsModuleManager;
exports.MongoDBKeyDescriptionStorage = MongoDBKeyDescriptionStorage;

exports.validateOperation = async ({operation}) => {
  try {
    await validateOperation(operation);
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
  moduleManager = defaultModuleManager
}) => {
  return await runOperation({operation, storage, moduleManager});
};
