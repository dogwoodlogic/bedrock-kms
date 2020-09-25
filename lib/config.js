/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');

const cfg = config.kms = {};
cfg.allowedHost = null;
cfg.keyRecordCache = {
  maxSize: 100,
  maxAge: 5000
};
