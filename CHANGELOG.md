# bedrock-kms ChangeLog

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
