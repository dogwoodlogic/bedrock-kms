/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores} = require('bedrock-kms');

describe('keystores APIs', () => {
  describe('insert API', () => {
    it('throws error on missing config', async () => {
      let err;
      let result;
      try {
        result = await keystores.insert();
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
        result = await keystores.insert({config});
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
        id: 'https://example.com/keystores/foo',
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.controller (string) is required');
    });
    it('throws error on missing config.kmsModule', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.kmsModule (string) is required');
    });
    it('throws error on missing config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1'
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('Keystore config sequence must be "0".');
    });
    it('throws error on negative config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: -1,
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('Keystore config sequence must be "0".');
    });
    it('throws error on float config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: 1.1,
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('Keystore config sequence must be "0".');
    });
    it('throws error on non-zero config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: 1,
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('Keystore config sequence must be "0".');
    });
    it('throws error on string config.sequence', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: '0',
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('Keystore config sequence must be "0".');
    });
    it('throws error on non-string config.id', async () => {
      let err;
      let result;
      const config = {
        id: 1,
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: '0',
      };
      try {
        result = await keystores.insert({config});
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
        id: 'https://example.com/keystores/foo',
        controller: 1,
        kmsModule: 'ssm-v1',
        sequence: '0',
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config.controller (string) is required');
    });
    it('successfully creates a keystore', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/foo',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: 0,
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('object');
      result.should.have.property('config');
      result.config.should.eql(config);
    });
    it('throws DuplicateError on duplicate keystore config', async () => {
      let err;
      let result;
      const config = {
        id:
          'https://example.com/keystores/fbea027c-ecc4-4562-b3dc-392db7b7c7c6',
        controller: 'bar',
        kmsModule: 'ssm-v1',
        sequence: 0,
      };
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result = undefined;
      err = undefined;
      try {
        result = await keystores.insert({config});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('DuplicateError');
    });
    it('throws DuplicateError on config with same controller and referenceId',
      async () => {
        // configs have unique IDs, but the same controller and referenceId
        let err;
        let result;
        const keystoreConfig1 = {
          id: 'https://example.com/keystores/fbea027c',
          controller: 'bar',
          kmsModule: 'ssm-v1',
          referenceId: 'urn:uuid:72b89236-7bb7-4d00-8930-9c74c4a7a4a8',
          sequence: 0,
        };
        try {
          result = await keystores.insert({config: keystoreConfig1});
        } catch(e) {
          err = e;
        }
        assertNoError(err);
        should.exist(result);

        const keystoreConfig2 = {
          id: 'https://example.com/keystores/4f398f8f',
          controller: 'bar',
          kmsModule: 'ssm-v1',
          referenceId: 'urn:uuid:72b89236-7bb7-4d00-8930-9c74c4a7a4a8',
          sequence: 0,
        };

        result = undefined;
        err = undefined;
        try {
          result = await keystores.insert({config: keystoreConfig2});
        } catch(e) {
          err = e;
        }
        should.exist(err);
        err.name.should.equal('DuplicateError');
      });
  }); // end insert API
}); // end keystore APIs
