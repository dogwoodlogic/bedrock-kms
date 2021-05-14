/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brPackageManager = require('bedrock-package-manager');

// load config defaults
require('./config');

module.exports = class BedrockKmsModuleManager {
  async get({id}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'webkms-module'});
    return require(packageName);
  }
};
