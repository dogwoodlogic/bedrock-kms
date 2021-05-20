/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores} = require('bedrock-kms');

describe('keystores APIs', () => {
  const mockConfigAlpha = {
    id: 'https://example.com/keystores/8b688649-d546-4e88-9027-da434bac495a',
    kmsModule: 'ssm-v1',
    controller: 'caf40b44-0e66-44ef-b331-23f6ca0bb837',
    sequence: 0,
  };
  // mockConfigBeta one and two have the same controller
  const mockConfigBeta1 = {
    id: 'https://example.com/keystores/6821b4ec-2630-4bf3-9464-39581d2c4499',
    kmsModule: 'ssm-v1',
    controller: '8a86d089-3a48-4096-a5a3-b874e873fb60',
    sequence: 0,
  };
  const mockConfigBeta2 = {
    id: 'https://example.com/keystores/448cf4ad-e9ff-4bd3-aa9a-b882cd01583c',
    kmsModule: 'ssm-v1',
    controller: '8a86d089-3a48-4096-a5a3-b874e873fb60',
    sequence: 0,
  };
  before(async () => {
    let err;
    try {
      await keystores.insert({config: mockConfigAlpha});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
  });
  before(async () => {
    let err;
    try {
      await keystores.insert({config: mockConfigBeta1});
      await keystores.insert({config: mockConfigBeta2});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
  });
  describe('find API', () => {
    it('throws on missing controller', async () => {
      let err;
      let result;
      try {
        result = await keystores.find();
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('options.controller (string) is required');
    });
    it('throws on non-string controller', async () => {
      let err;
      let result;
      try {
        result = await keystores.find({controller: 1});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('options.controller (string) is required');
    });
    it('successfully finds a keystore', async () => {
      let err;
      let results;
      try {
        results = await keystores.find(
          {controller: mockConfigAlpha.controller});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      results.should.be.an('array');
      results.should.have.length(1);
      const [result] = results;
      result.should.be.an('object');
      result.should.have.property('meta');
      result.meta.should.have.property('created');
      result.meta.should.have.property('updated');
      result.should.have.property('config');
      result.config.should.eql(mockConfigAlpha);
    });
    it('successfully finds multiple keystores for a controller', async () => {
      let err;
      let results;
      try {
        results = await keystores.find(
          {controller: mockConfigBeta1.controller});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      results.should.be.an('array');
      results.should.have.length(2);
      for(const result of results) {
        result.should.be.an('object');
        result.should.have.property('meta');
        result.meta.should.have.property('created');
        result.meta.should.have.property('updated');
        result.should.have.property('config');
      }
      results.map(r => r.config).should.have.deep.members([
        mockConfigBeta1, mockConfigBeta2
      ]);
    });
    it('returns empty array on unknown controller', async () => {
      const unknownController = 'bc794e06-e985-45d4-97c3-57d65d393736';
      let err;
      let results;
      try {
        results = await keystores.find({controller: unknownController});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      results.should.be.an('array');
      results.should.have.length(0);
    });
  });
});
