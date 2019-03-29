/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const helpers = require('./helpers');
const mockData = require('./mock.data');

describe('bedrock-kms', () => {
  before(async () => {});

  describe('runOperation API', () => {
    it('does something', async () => {
      const operation = {};
      let error;
      let result;
      try {
        result = await brKms.runOperation({operation});
      } catch(e) {
        error = e;
      }
    });
  }); // end callMethod API
}); // end bedrock-kms
