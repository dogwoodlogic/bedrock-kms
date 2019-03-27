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

  // FIXME: data model for kms is TBD
  /*
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
  */
});

/**
 * @module bedrock-kms
 */

exports.callMethod = async ({request}) => {

  // request is a document with an ocapld proof

  // validate the request document

  const plugin = 'foo'; // extracted from key id which comes out of request
  const method = 'bar'; // method is somewhere in request
  const controller = 'fooController'; // controller from the request
  const keyId = 'keyId'; // keyId from the request

  // TODO: on a create operation, create some linkage between controller and
  // keyId in the `kms` mongodb collection
  // on other types of operations, ensure that the ocap proof in the request
  // document corresponds to the proper keyId and controller.

  const {packageName} = brPackageManager.get(
    {alias: plugin, type: 'bedrock-kms-store'});
  const store = require(packageName);

  if(!(method in store)) {
    throw new BedrockError('Unknown method.', 'NotFoundError', {
      httpStatusCode: 404,
      method,
      plugin,
      public: true,
    });
  }

  return store[method]({keyId});
};
