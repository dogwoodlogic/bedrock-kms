/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');

const cfg = config.kms = {};
cfg.keystoreConfigCache = {
  maxSize: 1000,
  maxAge: 5 * 60 * 1000
};

// storage size to report to meter service
cfg.storageCost = {
  keystore: 1,
  key: 1
};
