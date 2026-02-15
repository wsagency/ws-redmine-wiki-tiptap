# Redmine Wiki Tiptap

A Redmine plugin that replaces the wiki textarea with a [Tiptap](https://tiptap.dev/) WYSIWYG editor. Full Markdown roundtrip — edits are stored as CommonMark, displayed as rich text.

## Requirements

- Redmine 6.0+
- Ruby 3.x / Rails 7.2+

## Installation

1. Clone into your Redmine plugins directory:

```bash
cd /path/to/redmine/plugins
git clone https://github.com/ws-agency/redmine_wiki_tiptap.git
```

2. Restart Redmine:

```bash
# If using Puma
bundle exec rails server
```

No database migrations required. No build step for end users — the JavaScript bundle is pre-built and committed.

## Features

### WYSIWYG Editor
- Rich text editing: bold, italic, strikethrough, inline code
- Headings (H1–H4)
- Bullet lists, ordered lists, task lists (checkboxes)
- Blockquotes, code blocks (with syntax highlighting), horizontal rules
- Tables (insert, add/remove rows/columns, resize)
- Images (upload via paste/drag-drop, or insert by URL)
- Links (insert/edit, auto-link URLs)
- Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)

### Markdown Roundtrip
- Content is always stored as Markdown
- Toggle between WYSIWYG and raw Markdown source at any time
- Lossless roundtrip for standard Markdown

### Redmine-Specific Support
- Preserves macros: `{{toc}}`, `{{child_pages}}`, `{{include(page)}}`, `{{collapse(title)}}...{{/collapse}}`
- Preserves issue references: `#123`
- Preserves wiki links: `[[PageName]]`, `[[PageName|Display Text]]`
- Preserves attachment syntax: `attachment:filename.png`
- Image paste/drop uploads via Redmine attachment API

### Additional
- Fullscreen editing mode
- Mermaid diagram support (if mermaid plugin is installed)
- Dark theme support (follows system preference)
- No jQuery dependency — vanilla JS only

## Building from Source

Only needed if you want to modify the JavaScript bundle:

```bash
cd build/
npm install
npm run build
```

This outputs to `assets/javascripts/wiki_tiptap.bundle.js`.

For development with auto-rebuild:

```bash
cd build/
npm run watch
```

Or using Make:

```bash
cd build/
make build    # install deps + build
make watch    # install deps + watch
make clean    # remove node_modules and bundle
```

## File Structure

```
init.rb                                     — Plugin registration
build/
  package.json                              — Tiptap dependencies
  esbuild.config.js                         — Build configuration
  Makefile                                  — Build commands
  src/
    index.js                                — Entry point, exports all extensions
    redmine-markdown.js                     — Markdown pre/post processing
    extensions/
      redmine-macro.js                      — {{macro}} nodes
      wiki-link.js                          — [[WikiLink]] nodes
      issue-reference.js                    — #123 nodes
      attachment-image.js                   — attachment:file nodes
assets/
  javascripts/
    wiki_tiptap.bundle.js                   — Pre-built Tiptap bundle
    wiki_tiptap_init.js                     — Editor initialization
  stylesheets/
    wiki_tiptap.css                         — Editor styles
lib/
  redmine_wiki_tiptap/
    hooks.rb                                — View hooks for asset injection
config/
  locales/
    en.yml                                  — English translations
    hr.yml                                  — Croatian translations
```

## License

MIT License. Copyright (c) 2025 Web Solutions Ltd (ws.agency).

See [LICENSE](LICENSE) for details.
