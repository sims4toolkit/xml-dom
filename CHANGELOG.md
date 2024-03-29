# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2023/07/06
### Changed
- Updated dependency on fast-xml-parser to resolve vulnerability.
### Fixed
- Element nodes with two comment/element children will no longer be written on one line.

## [0.2.4] - 2022/09/17
### Added
- Added `recycledNodesSeed` to XmlParsingOptions.
### Changed
- Changed recycled node IDs to bigints.

## [0.2.3] - 2022/08/24
### Added
- Added `equals()` method to the XmlNode interface.
### Fixed
- Order of children is now maintained when recycling nodes.

## [0.2.2] - 2022/08/07
### Fixed
- Fixed typo (XmlParsingRecycledResult.recylingCache => recyclingCache).

## [0.2.1] - 2022/08/07
### Fixed
- Do not throw when XML doc has multiple roots.

## [0.2.0] - 2022/08/07
### Added
- Add `XmlWrapperNode` to parse PI tags.
- Add `minify`, `writeComments`, and `writeProcessingInstructions` options to `XmlFormattingOptions`.
- Add `declaration` property to XmlDocumentNode.
- Add `recycleNodes` option to XmlDocumentNode.from() options.
- Add cell recycling for use with combined tuning.
- Add `fromRecycled()` method on XmlDocumentNode.
### Changed
- Rename `includeProcessingInstructions` option in `XmlFormattingOptions` to `writeXmlDeclaration`.
- XML documents now preserve the XML declaration they had when parsed.
- XML documents now allow multiple roots all the time.
### Removed
- Remove `allowMultipleRoots` option from XmlDocumentNode.from() options.

## [0.1.3] - 2022/02/17
### Changed
- Changed type of options in toXml() method to XmlFormattingOptions interface.
### Added
- Added includeProcessingInstructions option to XmlFormattingOptions.

## [0.1.2] - 2022/01/29
### Added
- Added `findChild()` method on XmlNode.

## [0.1.1] - 2022/01/23
### Changed
- Updated documentation.

## [0.1.0] - 2022/01/19
### Added
- First release.
