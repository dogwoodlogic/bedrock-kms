/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// load config defaults
require('./config');

exports.BedrockKmsModuleManager = require('./BedrockKmsModuleManager.js');
exports.MongoDBKeyDescriptionStorage =
  require('./MongoDBKeyDescriptionStorage.js');
