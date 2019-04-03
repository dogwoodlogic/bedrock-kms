/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _logger = require('./logger');
const _validator = require('./validator');
const bedrock = require('bedrock');
const brPackageManager = require('bedrock-package-manager');
const database = require('bedrock-mongodb');
const {promisify} = require('util');
const {util: {BedrockError}} = bedrock;
const URL = require('url');
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

exports.runOperation = async ({operation}) => {

  // invocationTarget may be an object or a string
  const {invocationTarget} = operation;
  const keyId = (typeof invocationTarget === 'string') ? invocationTarget :
    invocationTarget.id;

  const url = URL.parse(keyId);
  // since path starts with a slash, element 0 is an empty string
  const plugin = url.path.split('/')[2];

  // TODO: verify ocap invocation proof; ensure `controller` matches
  // key record

  await _validator.validate({operation});

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

  let recoveryMode = false;
  if(record && record.meta.pending) {
    recoveryMode = true;
  }

  if(recoveryMode && !isGenerateKeyOp) {
    // the caller was never told that the key generation succeeded
    // operations on pending keys are not allowed
    throw new BedrockError(
      'Key not found.',
      'NotFoundError',
      {key: keyId, httpStatusCode: 404, public: true});
  }

  // if there is an existing key record, controller must match in all cases
  if(record && record.key.controller !== controller) {
    throw new BedrockError(
      'Permission denied.',
      'NotAllowedError',
      {key: keyId, httpStatusCode: 400, public: true});
  }

  if(isGenerateKeyOp) {
    if(!record) {
      await insertKeyRecord(operation.invocationTarget);
    } else if(!recoveryMode) {
      throw new BedrockError(
        'Duplicate key identifier.',
        'DuplicateError',
        {key: keyId, httpStatusCode: 409, public: true});
    }
    // if recovery is true attempt to generate the key again
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

  let result;
  try {
    result = await store[method]({keyId, operation});
  } catch(e) {
    // anticipate a DuplicateError for a generate operation in recovery mode
    if(!(isGenerateKeyOp && recoveryMode && e.name === 'DuplicateError')) {
      _logger.error('A key operation failed.', {error: e});
      throw e;
    }
  }

  // remove pending flag
  if(isGenerateKeyOp) {
    await updateKeyRecord({keyId});
  }

  return result;
};

async function insertKeyRecord({id, type, controller}) {
  // insert the key information and get the updated record
  const now = Date.now();
  // pending flag will be removed after key generation succeeds
  const meta = {created: now, updated: now, pending: true};
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

async function updateKeyRecord({keyId}) {
  const result = await database.collections.kms.updateOne(
    {id: database.hash(keyId)},
    {$set: {'meta.updated': Date.now()}, $unset: {'meta.pending': ''}}
  );
  return result;
}
