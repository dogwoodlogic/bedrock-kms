# bedrock-kms ChangeLog

## 6.0.0 - 2021-04-TBD

### Changed
- **BREAKING**: Drop support for node 10.
- Support `ed25519-signature-2020` signature suite.
- Remove use of `jsonld-signatures`.
- Remove `@digitalbazaar/did-io` and use `bedrock-did-io`.
- Remove `did-method-key`.
- Update dependencies to latest:
  [bedrock-did-io@1.0](https://github.com/digitalbazaar/bedrock-did-io/pull/2),
  [webkms-switch@4.0](https://github.com/digitalbazaar/webkms-switch/pull/9).

## 5.0.0 - 2021-03-11

### Fixed
- **BREAKING**: Fix incorrectly configured MongoDB index on the `kmsKeystore`
  collection. If this software needs to be deployed along with an existing
  database, the index named `controller_1_config.referenceId_1` will need to
  be dropped manually. The index will be recreated automatically on Bedrock
  application startup.

## 4.0.1 - 2021-03-09

### Fixed
- Remove obsolete `allowedHost` config.

## 4.0.0 - 2021-03-09

### Added
- Keystore configurations may now include an optional `ipAllowList` array. If
  specified, the KMS system will only execute requests originating from IPs
  listed in `ipAllowList`. This applies to key operations for all keys in the
  keystore as well as modification of the configuration itself.

### Changed
- **BREAKING**: Change data model and validation of keystore configs. Configs
  no longer include `invoker` or `delegator` properties.

## 3.1.0 - 2020-09-25

## Added
- Add cache for public key records.

## 3.0.2 - 2020-07-09

## Fixed
- Fix usage of MongoDB projection API.

## 3.0.1 - 2020-06-09

## Added
- Add `delegator` and `invoker` as valid kms config properties.

## 3.0.0 - 2020-06-09

### Changed
- **BREAKING**: Upgraded to `bedrock-mongodb` ^7.0.0.
- Mongodb `update` is now `updateOne`.
- Mongodb `find` no longer accepts fields.

### Added
- `find` now throws in both options.projection and fields are set.

## 2.1.0 - 2020-05-15

### Changed
- Add support for `did:v1` resolution.
- Add dependency for `did-io`.
- Add dependency for `did-veres-one`.

## 2.0.1 - 2020-05-06

### Fixed
- Fix error handling in `keystore.update` API.

## 2.0.0 - 2020-04-02

### Changed
- **BREAKING**: Use webkms-switch@2.
- Remove unused peer deps.

## 1.4.0 - 2020-02-25

### Changed
- Add dependency for `did-key-method`.
- Add peer dependency for `bedrock-did-context`.
- Add peer dependency for `bedrock-jsonld-document-loader`.

## 1.3.0 - 2020-02-14

### Changed
- Use jsonld-signatures@5.

## 1.2.0 - 2020-02-07

### Added
- Add support for `inspectCapabilityChain` handler in `validateOperation`. This
  handler can be used to check for revocations in a capability chain.
- Handle reading DID key URLs (with `#`) in document loader.

## 1.1.0 - 2020-01-22

### Changed
- Specify peer dep bedrock-security-context@3.

## 1.0.2 - 2020-01-22

### Fixed
- Add missing jsonld-sigatures dep.

## 1.0.1 - 2019-12-20

### Fixed
- Fixed typo in module import.

## 1.0.0 - 2019-12-20

### Added
- Add core files.

- See git history for changes previous to this release.
