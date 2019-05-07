/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {KeyDescriptionStorage} = require('web-kms-switch');
const bedrock = require('bedrock');
const database = require('bedrock-mongodb');
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
  }, {
    // cover queries by controller
    collection: 'kms',
    fields: {controller: 1},
    options: {unique: false, background: false}
  }]);
});

module.exports = class MongoDBKeyDescriptionStorage
  extends KeyDescriptionStorage {
  async insert({key, meta}) {
    // insert the key information and get the updated record
    const now = Date.now();
    meta = {
      ...meta,
      created: now,
      updated: now
    };
    const record = {
      id: database.hash(key.id),
      controller: database.hash(key.controller),
      key,
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

  async update({id, key, meta}) {
    if(!(key || meta)) {
      throw new TypeError('"key" or "meta" must be given.');
    }

    const update = {$set: {}};
    if(key) {
      update.$set.controller = database.hash(key.controller);
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

  async get({id}) {
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

  async delete({id}) {
    throw new Error('Not implemented.');
  }
};
