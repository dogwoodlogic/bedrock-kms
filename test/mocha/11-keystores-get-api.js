/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores} = require('bedrock-kms');

describe('keystores APIs', () => {
  const mockConfig = {
    id: '0ea64f2a-06db-4055-93a5-c2f305cd541d',
    controller: '1e65ba0c-966e-440c-bd72-e4b97caeb7f3',
    sequence: 0,
  };
  before(async () => {
    let err;
    try {
      await keystores.insert({config: mockConfig});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
  });
  describe('get API', () => {
    it('throws on missing id', async () => {
      let err;
      let result;
      try {
        result = await keystores.get();
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('id (string) is required');
    });
    it('throws on non-string id', async () => {
      let err;
      let result;
      try {
        result = await keystores.get({id: 0});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('id (string) is required');
    });
    it('successfully gets a keystore', async () => {
      let err;
      let result;
      try {
        result = await keystores.get({id: mockConfig.id});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('object');
      result.should.have.property('meta');
      result.meta.should.have.property('created');
      result.meta.should.have.property('updated');
      result.should.have.property('config');
      result.config.should.eql(mockConfig);
    });
    it('successfully gets a keystore', async () => {
      const unknownId = 'bd9a90e3-2989-4d40-81c6-94ad0c98c56c';
      let err;
      let result;
      try {
        result = await keystores.get({id: unknownId});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('NotFoundError');
      err.details.keystoreId.should.equal(unknownId);
    });
  });
});
