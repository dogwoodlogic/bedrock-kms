/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const LRU = require('lru-cache');

// load config defaults
require('./config');

// module API
const api = {};
module.exports = api;

bedrock.events.on('bedrock.init', async () => {
  const cfg = bedrock.config.kms;
  api.keyRecords = new LRU({
    max: cfg.keyRecordCache.maxSize,
    maxAge: cfg.keyRecordCache.maxAge
  });
});
