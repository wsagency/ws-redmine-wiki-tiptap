# Changelog

All notable changes to ws-redmine-wiki-tiptap will be documented in this file.

## [1.1.0] - 2026-02-16

### Added
- Plugin settings page with enable/disable toggle (Configure link on Plugins page)

## [1.0.1] - 2026-02-14

### Fixed
- Exclude `build/node_modules/` from git repository (removed 1707 files / 23MB)

## [1.0.0] - 2026-02-14

### Added
- Tiptap WYSIWYG editor replacing default wiki textarea
- Rich text toolbar with full formatting options
- Markdown roundtrip (CommonMark ↔ rich text)
- Toggle between WYSIWYG and raw Markdown source
- Pre-built via esbuild (no build pipeline needed in Redmine)
