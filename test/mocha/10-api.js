/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const helpers = require('./helpers');
const mockData = require('./mock.data');

describe('bedrock-kms', () => {
  before(async () => {});

  describe('alpha API', () => {
    describe('section 1', async () => {
      it('Test A', async () => {});
    }); // end section 1
  }); // end alpha API
  describe('beta API', () => {
    describe('section 1', () => {
      it('should return error on non-existent account', async () => {});
    }); // end section 1
  }); // end beta API
}); // end bedrock-kms
