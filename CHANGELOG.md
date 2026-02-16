# Changelog

All notable changes to ws-redmine-wiki-tiptap will be documented in this file.

## [1.0.1] - 2026-02-14

### Fixed
- Exclude `build/node_modules/` from git repository (removed 1707 files / 23MB)

## [1.0.0] - 2026-02-14

### Added
- Tiptap WYSIWYG editor replacing default wiki textarea
- Rich text toolbar: headings, bold, italic, strikethrough, code
- Lists: bullet, ordered, task lists
- Block elements: blockquote, code block, horizontal rule
- Table support with add/remove row/column
- Links and images
- Markdown roundtrip: converts between CommonMark and rich text
- Pre-built via esbuild (no build pipeline needed in Redmine)
- Toggle between WYSIWYG and raw Markdown source
