/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _logger = require('./logger');
const bedrock = require('bedrock');
const brPackageManager = require('bedrock-package-manager');
const database = require('bedrock-mongodb');
const {promisify} = require('util');
const {util: {BedrockError}} = bedrock;
require('bedrock-security-context');

// load config defaults
require('./config');

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await promisify(database.openCollections)(['kms']);

  await promisify(database.createIndexes)([{
    // cover queries by ID
    collection: 'kms',
    fields: {id: 1},
    options: {unique: true, background: false}
  }, {
    // cover queries by controller
    collection: 'kms',
    fields: {controller: 1},
    options: {unique: false, background: false}
  }]);
});

/**
 * @module bedrock-kms
 */

exports.runOperation = async ({keyId, plugin, operation}) => {
  // TODO: verify ocap invocation proof; ensure `controller` matches
  // key record
  const controller = operation.proof.verificationMethod;

  const isGenerateKeyOp = operation.type === 'GenerateKeyOperation';

  let record;
  try {
    record = await getKeyRecord({id: keyId});
  } catch(e) {
    if(!(isGenerateKeyOp && e.name === 'NotFoundError')) {
      throw e;
    }
  }

  if(isGenerateKeyOp) {
    // TODO: handle cornercase where record insert worked previously but the
    // plugin did not generate the key... currently, we insert the record
    // first in case we crash before using the plugin but perhaps this should
    // be inverted once this TODO is handled

    // check for duplicate key
    if(record) {
      throw new BedrockError(
        'Duplicate key identifier.',
        'DuplicateError',
        {key: keyId, httpStatusCode: 409, public: true});
    }
    await insertKeyRecord(operation.invocationTarget);
  } else {
    // ensure `controller` matches existing record
    if(record.key.controller !== controller) {
      throw new BedrockError(
        'Key not found.',
        'NotFoundError',
        {key: keyId, httpStatusCode: 404, public: true});
    }
  }

  const {packageName} = brPackageManager.get(
    {alias: plugin, type: 'bedrock-kms-store'});
  const store = require(packageName);

  // determine method
  const method = operation.type.charAt(0).toLowerCase() +
    operation.type.substring(1, operation.type.indexOf('Operation'));

  if(!(method in store)) {
    throw new BedrockError(
      'KMS operation not supported.', 'NotSupportedError', {
        httpStatusCode: 400,
        method,
        plugin,
        public: true
      });
  }

  const result = await store[method]({keyId});

  // TODO: if generating a key failed, remove key record so the ID can be
  // used again
  //if(isGenerateKeyOp)

  return result;
};

async function insertKeyRecord({id, type, controller}) {
  // insert the key information and get the updated record
  const now = Date.now();
  const meta = {created: now, updated: now};
  const record = {
    id: database.hash(id),
    controller: database.hash(controller),
    key: {id, type, controller},
    meta
  };
  try {
    const result = await database.collections.kms.insert(
      record, database.writeOptions);
    return result.ops[0];
  } catch(e) {
    if(!database.isDuplicateError(e)) {
      throw e;
    }
    throw new BedrockError(
      'Duplicate key.',
      'DuplicateError', {
        public: true,
        httpStatusCode: 409
      }, e);
  }
}

async function getKeyRecord({id}) {
  const record = await database.collections.kms.findOne(
    {id: database.hash(id)},
    {_id: 0, key: 1, meta: 1});
  if(!record) {
    throw new BedrockError(
      'Key not found.',
      'NotFoundError',
      {key: id, httpStatusCode: 404, public: true});
  }
  return record;
}
