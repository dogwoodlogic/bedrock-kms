/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {ModuleManager} = require('web-kms-switch');
const brPackageManager = require('bedrock-package-manager');

// load config defaults
require('./config');

module.exports = class BedrockKmsModuleManager extends ModuleManager {
  constructor() {}

  async get({id}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'web-kms-module'});
    return require(packageName);
  }
};
