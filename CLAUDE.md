# CLAUDE.md — ws-redmine-wiki-tiptap

## Project
Redmine plugin that replaces the wiki textarea with a Tiptap WYSIWYG editor.
Full Markdown roundtrip — edits are stored as CommonMark, displayed as rich text.
Open source, MIT license. Copyright Web Solutions Ltd (ws.agency). Initial development Kristijan Lukačin.

## Stack
- **Backend:** Ruby on Rails (Redmine 6.1 plugin architecture, Rails 7.2.3)
- **Frontend:** Tiptap 2.x (ProseMirror-based), vendored/bundled JS, CSS
- **Build:** Esbuild or pre-built bundle (Redmine doesn't have webpack/vite)
- **No jQuery dependency** — vanilla JS only

## What It Does

### WYSIWYG Wiki Editor
- Replaces the `<textarea>` on wiki edit pages with a rich text Tiptap editor
- **Markdown roundtrip:** CommonMark → Tiptap HTML → CommonMark (using tiptap-markdown or similar)
- **Toggle button:** Switch between WYSIWYG and raw Markdown view at any time
- Content is always STORED as Markdown (Redmine's native format) — Tiptap is just the editing layer
- On form submit, convert Tiptap HTML back to Markdown and put it in the hidden textarea

### Toolbar
Floating toolbar above editor with these groups:

**Text formatting:**
- Bold, Italic, Strikethrough, Code (inline)
- Clear formatting

**Headings:**
- H1, H2, H3, H4 dropdown

**Lists:**
- Bullet list, Ordered list, Task list (checkboxes)
- Indent, Outdent

**Blocks:**
- Blockquote
- Code block (with language selector)
- Horizontal rule
- Table (insert, add/remove rows/columns)

**Media:**
- Image (upload + URL)
- Link (insert/edit)

**Advanced:**
- Mermaid diagram block (if mermaid plugin installed — detect and show button)
- Table of contents placeholder

**View:**
- Toggle WYSIWYG / Markdown source
- Fullscreen editing mode

### Editor Features
- **Placeholder text:** "Start writing..." when empty
- **Keyboard shortcuts:** Cmd+B bold, Cmd+I italic, Cmd+K link, etc. (standard)
- **Paste handling:**
  - Paste plain text → normal text
  - Paste HTML (from browser) → convert to Markdown-compatible nodes
  - Paste images → trigger Redmine's attachment upload, insert reference
  - Paste URL on selected text → create link
- **Drag & drop images** → upload as attachment, insert reference
- **Auto-link:** URLs typed in text auto-convert to clickable links
- **Table editing:** Visual table editor (add/remove rows/cols, resize columns)
- **Code blocks:** Syntax highlighting preview (basic, using CSS classes)
- **Focus mode:** Click outside editor to deselect, click inside to edit

### Image Upload Integration
- Redmine wiki uses attachments for images: `![image](attached_filename.png)`
- When user pastes/drops an image:
  1. Upload to Redmine via standard attachment mechanism (POST `/uploads.json`)
  2. Insert Markdown image reference
- Also support inserting by URL (external images)
- Show upload progress indicator

### Markdown ↔ Tiptap Conversion
- Use `tiptap-markdown` extension for bidirectional conversion
- On load: parse textarea Markdown → set Tiptap content
- On save: serialize Tiptap content → Markdown → set textarea value
- Handle Redmine-specific Markdown extensions:
  - `{{toc}}` — table of contents macro (preserve as-is)
  - `{{include(PageName)}}` — include macro (preserve as-is)
  - `#123` — issue references (preserve as-is)
  - `[[WikiLink]]` — internal wiki links (preserve as-is)
  - `attachment:filename.png` — Redmine attachment syntax

### Preserve Redmine Macros
Redmine has special macros in wiki content. These MUST be preserved during roundtrip:
- `{{toc}}`, `{{child_pages}}`, `{{include(page)}}`, `{{collapse(title)}}...{{/collapse}}`
- Treat them as **atomic inline/block nodes** in Tiptap — render with a distinctive visual style (e.g., grey pill with macro name) but don't try to parse their content
- On serialization back to Markdown, output them exactly as they were

## Architecture

### Build Strategy
Since Redmine doesn't have a JS build pipeline, we need to pre-bundle Tiptap:

**Option A (recommended): Pre-built bundle**
- Create a separate `build/` directory with package.json
- Bundle all Tiptap extensions into a single `wiki_tiptap.bundle.js` using esbuild
- Commit the built bundle to `assets/javascripts/`
- Include a `Makefile` or script for rebuilding

**Option B: CDN/importmap**
- Use ES module imports from CDN
- Requires modern browser support

Go with Option A — more reliable, works offline.

### Files to Create
```
init.rb                                        — Plugin registration
build/package.json                             — Tiptap dependencies for bundling
build/src/index.js                             — Entry point, imports all extensions
build/esbuild.config.js                        — Build configuration
build/Makefile                                 — Build commands
assets/javascripts/wiki_tiptap.bundle.js       — Pre-built Tiptap bundle (~300KB)
assets/javascripts/wiki_tiptap_init.js         — Plugin initialization, textarea replacement
assets/stylesheets/wiki_tiptap.css             — Editor styles, toolbar, modal
lib/redmine_wiki_tiptap/hooks.rb               — View hooks for asset injection
config/locales/en.yml                          — English translations
config/locales/hr.yml                          — Croatian translations
README.md                                      — Documentation
LICENSE                                        — MIT license
```

### Tiptap Extensions to Include
```javascript
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'           // Basic nodes + marks
import Link from '@tiptap/extension-link'               // Links
import Image from '@tiptap/extension-image'             // Images
import Table from '@tiptap/extension-table'             // Tables
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'      // Task lists
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder' // Placeholder text
import Typography from '@tiptap/extension-typography'   // Smart quotes, etc.
import { Markdown } from 'tiptap-markdown'              // MD roundtrip
```

### Textarea Replacement Logic
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Find the wiki content textarea (id: 'content_text' on wiki edit page)
  const textarea = document.getElementById('content_text');
  if (!textarea) return;

  // Create editor container
  const editorContainer = document.createElement('div');
  editorContainer.id = 'wiki-tiptap-editor';
  textarea.parentNode.insertBefore(editorContainer, textarea);
  textarea.style.display = 'none';

  // Initialize Tiptap with Markdown content from textarea
  const editor = new Editor({
    element: editorContainer,
    extensions: [StarterKit, Markdown, Link, Image, Table, ...],
    content: textarea.value, // Markdown → parsed by tiptap-markdown
  });

  // On form submit: serialize back to Markdown, put in textarea
  textarea.closest('form').addEventListener('submit', function() {
    textarea.value = editor.storage.markdown.getMarkdown();
  });
});
```

## Critical Redmine 6.1 + Rails 7.2 Rules
1. Use `prepend` for any patches (NOT `alias_method_chain`)
2. Plugin assets: `assets/` → served from `/plugin_assets/redmine_wiki_tiptap/`
3. No database migrations needed
4. No controller changes needed — works purely on frontend
5. Wiki edit page textarea ID: usually `content_text` (verify!)
6. Redmine uses CommonMark with `commonmarker` gem
7. **Must not break** wiki preview functionality (Preview button)
8. **Must not break** regular save — Markdown in textarea is what gets saved

## Build Instructions
```bash
cd build/
npm install
npm run build    # → outputs to ../assets/javascripts/wiki_tiptap.bundle.js
```

## Quality Checklist
- [ ] Tiptap editor replaces textarea on wiki edit page
- [ ] Rich text editing works: bold, italic, headings, lists, links, images, tables
- [ ] Toggle between WYSIWYG and Markdown source
- [ ] Markdown roundtrip is lossless (type in WYSIWYG, switch to source, switch back)
- [ ] Redmine macros preserved: {{toc}}, {{include}}, {{child_pages}}
- [ ] Issue references preserved: #123
- [ ] Wiki links preserved: [[PageName]]
- [ ] Image paste/drop uploads via Redmine attachment API
- [ ] Table editing works (add/remove rows/columns)
- [ ] Code blocks render with monospace font
- [ ] Task lists (checkboxes) work
- [ ] Keyboard shortcuts work (Cmd+B, Cmd+I, Cmd+K)
- [ ] Form submission saves correct Markdown
- [ ] Preview button still works
- [ ] No conflicts with other wiki plugins (mermaid, sidebar)
- [ ] Editor looks good in both light and dark themes
- [ ] Fullscreen mode works
- [ ] No JavaScript errors in console
- [ ] Bundle size reasonable (< 500KB)
- [ ] Plugin installs cleanly (no migrations, no build step for end user)
