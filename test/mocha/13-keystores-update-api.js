/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores} = require('bedrock-kms');
const {util: {clone}} = require('bedrock');

describe('keystores APIs', () => {
  const mockConfigAlpha = {
    id: 'b122cc8a-39be-4680-b88e-2593b1295b1b',
    controller: '8a945a10-9f6a-4096-8306-c6c6825a9fe2',
    sequence: 0,
    referenceId: '95901c02-a4ad-4d3a-be17-0be3aafbe6f3',
  };
  const mockConfigBeta = {
    id: 'f454ad49-90eb-4f15-aff9-13048adc84d0',
    controller: '8e79ce0e-926d-457c-b520-849663e1d9de',
    sequence: 0,
  };
  const mockConfigGamma = {
    id: '6be652c3-3ed6-452b-a98a-cb0ad6905f37',
    controller: 'f2da13ee-50d2-46ab-865d-ee23d609edbd',
    sequence: 0,
  };

  before(async () => {
    let err;
    try {
      await keystores.insert({config: mockConfigAlpha});
      await keystores.insert({config: mockConfigBeta});
      await keystores.insert({config: mockConfigGamma});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
  });
  describe('update API', () => {
    it('throws error on missing config', async () => {
      let err;
      let result;
      try {
        result = await keystores.update();
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config (object) is required');
    });
    it('throws error on missing config.id', async () => {
      let err;
      let result;
      const config = {};
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.id (string) is required');
    });
    it('throws error on missing config.controller', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.controller (string) is required');
    });
    it('throws error on missing config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 'bar',
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.sequence (number) is required');
    });
    it('throws error on negative config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 'bar',
        sequence: -1,
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain(
        'Keystore config sequence must be a positive integer.');
    });
    it('throws error on float config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 'bar',
        sequence: 1.1,
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain(
        'Keystore config sequence must be a positive integer.');
    });
    it('throws error on zero config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 'bar',
        sequence: 0,
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain(
        'Keystore config sequence must be a positive integer.');
    });
    it('throws error on string config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 'bar',
        sequence: '0',
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.sequence (number) is required');
    });
    it('throws error on non-string config.id', async () => {
      let err;
      let result;
      const config = {
        id: 1,
        controller: 'bar',
        sequence: '0',
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.id (string) is required');
    });
    it('throws error on non-string config.controller', async () => {
      let err;
      let result;
      const config = {
        id: 'foo',
        controller: 1,
        sequence: '0',
      };
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.controller (string) is required');
    });
    it('throws error on non-string config.referenceId', async () => {
      const testReferenceIds = [1, false, {}, []];
      for(let index = 0; index < testReferenceIds.length; index++) {
        const referenceId = testReferenceIds[index];
        let err;
        let result;
        const config = {
          id: 'foo',
          controller: '1',
          sequence: 1,
          referenceId
        };
        try {
          result = await keystores.update({config});
        } catch(e) {
          err = e;
        }
        should.not.exist(result);
        should.exist(err);
        err.message.should.contain('config.referenceId (string) is required');
      }
    });
    it('successfully updates a keystore', async () => {
      let err;
      let result;
      const config = clone(mockConfigAlpha);
      config.sequence++;
      // FIXME: should updating controller be allowed?
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;
    });
    it('successfully updates a keystore twice', async () => {
      let err;
      let result;
      const config = clone(mockConfigBeta);
      config.sequence++;
      // FIXME: should updating controller be allowed?
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;

      // update same config again
      config.sequence++;
      // FIXME: should updating controller be allowed?
      config.controller = 'someOtherController2';
      result = undefined;
      err = undefined;
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;
    });
    it('fails to updates a keystore using wrong sequence number', async () => {
      let err;
      let result;
      const config = clone(mockConfigGamma);
      config.sequence++;
      // FIXME: should updating controller be allowed?
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;

      // update same config again without updating the sequence number
      // config.sequence++;

      // FIXME: should updating controller be allowed?
      config.controller = 'someOtherController2';
      result = undefined;
      err = undefined;
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('InvalidStateError');
      err.details.id.should.equal(config.id);
      err.details.sequence.should.equal(config.sequence);
    });
    it('throws error on unknown keystore id', async () => {
      let err;
      let result;
      const config = clone(mockConfigBeta);
      config.sequence++;
      config.id = 'someOtherId';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('InvalidStateError');
    });
    it('throws error if config-fields other than id, controller, sequence or' +
    'referenceId', async () => {
      let err;
      let result;
      const config = clone(mockConfigBeta);
      config.someKey = 'not id, controller, sequence or referenceId';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('DataError');
    });
  });
});
