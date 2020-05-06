/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const assert = require('assert-plus');
const bedrock = require('bedrock');
const database = require('bedrock-mongodb');
const {promisify} = require('util');
const {BedrockError} = bedrock.util;

// load config defaults
require('./config');

// module API
const api = {};
module.exports = api;

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await promisify(database.openCollections)(['kmsKeystore']);

  await promisify(database.createIndexes)([{
    // cover queries keystore by ID
    collection: 'kmsKeystore',
    fields: {id: 1},
    options: {unique: true, background: false}
  }, {
    // cover config queries by controller
    collection: 'kmsKeystore',
    fields: {controller: 1},
    options: {unique: false, background: false}
  }, {
    // ensure config uniqueness of reference ID per controller
    collection: 'kmsKeystore',
    fields: {controller: 1, 'config.referenceId': 1},
    options: {
      partialFilterExpression: {
        'config.referenceId': true
      },
      unique: true,
      background: false
    }
  }]);
});

/**
 * Establishes a new keystore by inserting its configuration into storage.
 *
 * @param {Object} config the keystore configuration.
 *
 * @return {Promise<Object>} resolves to the database record.
 */
api.insert = async ({config}) => {
  assert.object(config, 'config');
  assert.string(config.id, 'config.id');
  assert.string(config.controller, 'config.controller');

  // require starting sequence to be 0
  if(config.sequence !== 0) {
    throw new BedrockError(
      'Keystore config sequence must be "0".',
      'DataError', {
        public: true,
        httpStatusCode: 400
      });
  }

  const {controller} = config;

  // insert the configuration and get the updated record
  const now = Date.now();
  const meta = {created: now, updated: now};
  const record = {
    id: database.hash(config.id),
    controller: database.hash(controller),
    meta,
    config
  };
  try {
    const result = await database.collections.kmsKeystore.insert(
      record, database.writeOptions);
    return result.ops[0];
  } catch(e) {
    if(!database.isDuplicateError(e)) {
      throw e;
    }
    throw new BedrockError(
      'Duplicate keystore configuration.',
      'DuplicateError', {
        public: true,
        httpStatusCode: 409
      }, e);
  }
};

/**
 * Retrieves all keystore configs matching the given query.
 *
 * @param {string} controller the controller for the keystores to retrieve.
 * @param {Object} query the optional query to use (default: {}).
 * @param {Object} fields optional fields to include or exclude (default: {}).
 * @param {Object} options options (eg: 'sort', 'limit').
 *
 * @return {Promise<Array>} resolves to the records that matched the query.
 */
api.find = async (
  {controller, query = {}, fields = {}, options = {}}) => {
  // force controller ID
  query.controller = database.hash(controller);
  return database.collections.kmsKeystore.find(
    query, fields, options).toArray();
};

/**
 * Updates a keystore config if its sequence number is next.
 *
 * @param {Object} config the keystore configuration.
 *
 * @return {Promise<Object>} resolves to the database record.
 */
api.update = async ({config}) => {
  assert.object(config, 'config');
  assert.string(config.id, 'config.id');
  assert.number(config.sequence, config.sequence);
  assert.string(config.controller, 'config.controller');

  // check permission against controller ID
  const {controller} = config;

  // insert the configuration and get the updated record
  const now = Date.now();

  const result = await database.collections.kmsKeystore.update({
    id: database.hash(config.id),
    'config.sequence': config.sequence - 1
  }, {
    $set: {
      config,
      controller: database.hash(controller),
      'meta.updated': now
    }
  }, database.writeOptions);

  if(result.result.n === 0) {
    // no records changed...
    throw new BedrockError(
      'Could not update keystore configuration. ' +
      'Record sequence does not match or keystore does not exist.',
      'InvalidStateError', {httpStatusCode: 409, public: true});
  }

  return true;
};

/**
 * Gets a keystore configuration.
 *
 * @param {string} id the ID of the keystore.
 *
 * @return {Promise<Object>} resolves to `{config, meta}`.
 */
api.get = async ({id}) => {
  assert.string(id, 'id');

  const record = await database.collections.kmsKeystore.findOne(
    {id: database.hash(id)},
    {_id: 0, config: 1, meta: 1});
  if(!record) {
    throw new BedrockError(
      'Keystore configuration not found.',
      'NotFoundError',
      {dataHub: id, httpStatusCode: 404, public: true});
  }

  return record;
};
