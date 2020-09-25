/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {ModuleManager} = require('webkms-switch');
const brPackageManager = require('bedrock-package-manager');

// load config defaults
require('./config');

module.exports = class BedrockKmsModuleManager extends ModuleManager {
  async get({id}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'webkms-module'});
    return require(packageName);
  }
};
