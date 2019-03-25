/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _logger = require('./logger');
const bedrock = require('bedrock');
const brPackageManager = require('bedrock-package-manager');
const {util: {BedrockError}} = bedrock;

// load config defaults
require('./config');

/**
 * @module bedrock-kms
 */

exports.callMethod = async ({request}) => {

  // request is a document with an ocapld proof

  // validate the request document

  const plugin = 'foo'; // extracted from key id which comes out of request
  const method = 'bar'; // method is somewhere in request
  const controller = 'fooController'; // controller IS the keyID?
  const keyId = controller; // are controller and keyID truely synonymous?

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
