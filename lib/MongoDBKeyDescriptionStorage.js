/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {KeyDescriptionStorage} = require('webkms-switch');
const bedrock = require('bedrock');
const caches = require('./caches.js');
const database = require('bedrock-mongodb');
const keystores = require('./keystores.js');
const {promisify} = require('util');
const {util: {BedrockError}} = bedrock;

// load config defaults
require('./config');

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await promisify(database.openCollections)(['kms']);

  await promisify(database.createIndexes)([{
    // cover queries by ID
    collection: 'kms',
    fields: {id: 1},
    options: {unique: true, background: false}
  }]);
});

module.exports = class MongoDBKeyDescriptionStorage
  extends KeyDescriptionStorage {
  async insert({key, meta} = {}) {
    // insert the key information and get the updated record
    const now = Date.now();
    meta = {
      ...meta,
      created: now,
      updated: now
    };
    const record = {
      id: database.hash(key.id),
      key: {...key},
      meta
    };
    // delete key's controller; the one from the keystore's config will be
    // used in `.get()`
    delete key.controller;
    try {
      const result = await database.collections.kms.insertOne(
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

  async update({id, key, meta}) {
    if(!(key || meta)) {
      throw new TypeError('"key" or "meta" must be given.');
    }

    // invalidate cache
    caches.keyRecords.del(id);

    const update = {$set: {}};
    if(key) {
      // delete key's controller; the one from the keystore's config will be
      // used in `.get()`
      key = {...key};
      delete key.controller;
      update.$set.key = key;
    }
    if(meta) {
      meta = {
        ...meta,
        updated: Date.now()
      };
      update.$set.meta = meta;
    }
    await database.collections.kms.updateOne({id: database.hash(id)}, update);
  }

  async get({id} = {}) {
    let promise = caches.keyRecords.get(id);
    if(promise) {
      return promise;
    }

    promise = _getUncachedKeyRecord({id});
    caches.keyRecords.set(id, promise);

    let record;
    try {
      record = await promise;
    } catch(e) {
      caches.keyRecords.del(id);
      throw e;
    }

    return record;
  }

  async delete({/*id*/}) {
    throw new Error('Not implemented.');
  }
};

function _parseKeystoreId(keyId) {
  // key ID format: <baseUrl>/<keystores-path>/<keystore-id>/keys/<key-id>
  const idx = keyId.lastIndexOf('/keys/');
  if(idx === -1) {
    throw new Error(`Invalid key ID "${keyId}".`);
  }
  return keyId.substr(0, idx);
}

async function _getUncachedKeyRecord({id}) {
  // always override `controller` with the one from keystore's config...
  const keystoreId = _parseKeystoreId(id);
  const [{config}, record] = await Promise.all([
    keystores.get({id: keystoreId}),
    database.collections.kms.findOne(
      {id: database.hash(id)},
      {projection: {_id: 0, key: 1, meta: 1}})
  ]);
  if(!record || !config) {
    throw new BedrockError(
      'Key not found.',
      'NotFoundError',
      {key: id, httpStatusCode: 404, public: true});
  }
  record.key.controller = config.controller;
  return record;
}
