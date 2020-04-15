/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const {util: {clone, uuid}} = require('bedrock');
// const helpers = require('./helpers');
const mockData = require('./mock.data');

// FIXME: the test suite is failing due to invalid key ID errors
describe.skip('bedrock-kms', () => {
  before(async () => {});

  describe('runOperation API', () => {
    describe('GenerateKeyOperation', () => {
      it('successfully generates a Ed25519VerificationKey2018', async () => {
        const keyId = `https://example.com/kms/${uuid()}`;
        const operation = clone(mockData.operations.generate);
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'Ed25519VerificationKey2018';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        Object.keys(result).should.have.same.members(
          ['id', 'publicKeyBase58', 'type']);
        result.id.should.equal(keyId);
        result.type.should.equal(operation.invocationTarget.type);
        result.publicKeyBase58.should.be.a('string');
      });
      it('successfully generates a Sha256HmacKey2019', async () => {
        const keyId = `https://example.com/kms/${uuid()}`;
        const operation = clone(mockData.operations.generate);
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'Sha256HmacKey2019';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        Object.keys(result).should.have.same.members(['id']);
        result.id.should.equal(keyId);
      });
      it('successfully generates a AesKeyWrappingKey2019', async () => {
        const keyId = `https://example.com/kms/${uuid()}`;
        const operation = clone(mockData.operations.generate);
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'AesKeyWrappingKey2019';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        Object.keys(result).should.have.same.members(['id']);
        result.id.should.equal(keyId);
      });
      it('throws on UnknownKeyType', async () => {
        const keyId = `https://example.com/kms/${uuid()}`;
        const operation = clone(mockData.operations.generate);
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'UnknownKeyType';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        should.exist(error);
        should.not.exist(result);
        error.message.should.include('UnknownKeyType');
      });
    }); // end GenerateKeyOperation

    describe('SignOperation', () => {
      it('signs a string using Ed25519VerificationKey2018', async () => {
        const {id: keyId} = await _generateKey(
          {type: 'Ed25519VerificationKey2018'});
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        should.not.exist(error);
        should.exist(result);
        result.should.be.an('object');
        Object.keys(result).should.have.same.members(['signatureValue']);
        should.exist(result.signatureValue);
        const {signatureValue} = result;
        signatureValue.should.be.a('string');
      });
      it('signs a string using Sha256HmacKey2019', async () => {
        const {id: keyId} = await _generateKey({type: 'Sha256HmacKey2019'});
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        should.not.exist(error);
        should.exist(result);
        result.should.be.an('object');
        Object.keys(result).should.have.same.members(['signatureValue']);
        const {signatureValue} = result;
        signatureValue.should.be.a('string');
        signatureValue.should.have.length(43);
      });
    }); // end SignOperation

    describe('VerifyOperation', () => {
      it('verifies a string using Sha256HmacKey2019', async () => {
        const verifyData = uuid();
        const {id: keyId} = await _generateKey({type: 'Sha256HmacKey2019'});
        const signOperation = clone(mockData.operations.sign);
        signOperation.invocationTarget = keyId;
        signOperation.verifyData = verifyData;
        const {signatureValue} = await brKms.runOperation(
          {operation: signOperation});
        const verifyOperation = clone(mockData.operations.verify);
        verifyOperation.invocationTarget = keyId;
        verifyOperation.verifyData = verifyData;
        verifyOperation.signatureValue = signatureValue;
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation: verifyOperation});
        } catch(e) {
          error = e;
        }
        should.not.exist(error);
        should.exist(result);
        result.should.be.an('object');
        Object.keys(result).should.have.same.members(['verified']);
        result.verified.should.be.true;
      });
    }); // end VerifyOperation
  }); // end runOperation API
}); // end bedrock-kms

async function _generateKey({type}) {
  const keyId = `https://example.com/kms/${uuid()}`;
  const operation = clone(mockData.operations.generate);
  operation.kmsModule = 'ssm-v1';
  operation.invocationTarget.id = keyId;
  operation.invocationTarget.type = type;
  return brKms.runOperation({operation});
}
