(function () {
  'use strict';

  var WT = window.WikiTiptap;
  if (!WT) return;

  // ── Toolbar definition ──────────────────────────────────────────────
  var TOOLBAR_GROUPS = [
    {
      name: 'formatting',
      buttons: [
        { id: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', cmd: function (e) { e.chain().focus().toggleBold().run(); }, active: function (e) { return e.isActive('bold'); } },
        { id: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', cmd: function (e) { e.chain().focus().toggleItalic().run(); }, active: function (e) { return e.isActive('italic'); } },
        { id: 'strike', icon: 'S', title: 'Strikethrough', cmd: function (e) { e.chain().focus().toggleStrike().run(); }, active: function (e) { return e.isActive('strike'); } },
        { id: 'code', icon: '</>', title: 'Inline Code', cmd: function (e) { e.chain().focus().toggleCode().run(); }, active: function (e) { return e.isActive('code'); } },
        { id: 'clearformat', icon: 'T\u0338', title: 'Clear Formatting', cmd: function (e) { e.chain().focus().unsetAllMarks().clearNodes().run(); } },
      ],
    },
    {
      name: 'headings',
      buttons: [
        { id: 'h1', icon: 'H1', title: 'Heading 1', cmd: function (e) { e.chain().focus().toggleHeading({ level: 1 }).run(); }, active: function (e) { return e.isActive('heading', { level: 1 }); } },
        { id: 'h2', icon: 'H2', title: 'Heading 2', cmd: function (e) { e.chain().focus().toggleHeading({ level: 2 }).run(); }, active: function (e) { return e.isActive('heading', { level: 2 }); } },
        { id: 'h3', icon: 'H3', title: 'Heading 3', cmd: function (e) { e.chain().focus().toggleHeading({ level: 3 }).run(); }, active: function (e) { return e.isActive('heading', { level: 3 }); } },
        { id: 'h4', icon: 'H4', title: 'Heading 4', cmd: function (e) { e.chain().focus().toggleHeading({ level: 4 }).run(); }, active: function (e) { return e.isActive('heading', { level: 4 }); } },
      ],
    },
    {
      name: 'lists',
      buttons: [
        { id: 'bulletlist', icon: '\u2022', title: 'Bullet List', cmd: function (e) { e.chain().focus().toggleBulletList().run(); }, active: function (e) { return e.isActive('bulletList'); } },
        { id: 'orderedlist', icon: '1.', title: 'Ordered List', cmd: function (e) { e.chain().focus().toggleOrderedList().run(); }, active: function (e) { return e.isActive('orderedList'); } },
        { id: 'tasklist', icon: '\u2611', title: 'Task List', cmd: function (e) { e.chain().focus().toggleTaskList().run(); }, active: function (e) { return e.isActive('taskList'); } },
        { id: 'indent', icon: '\u2192', title: 'Indent', cmd: function (e) { e.chain().focus().sinkListItem('listItem').run(); } },
        { id: 'outdent', icon: '\u2190', title: 'Outdent', cmd: function (e) { e.chain().focus().liftListItem('listItem').run(); } },
      ],
    },
    {
      name: 'blocks',
      buttons: [
        { id: 'blockquote', icon: '\u201C', title: 'Blockquote', cmd: function (e) { e.chain().focus().toggleBlockquote().run(); }, active: function (e) { return e.isActive('blockquote'); } },
        { id: 'codeblock', icon: '{ }', title: 'Code Block', cmd: function (e) { e.chain().focus().toggleCodeBlock().run(); }, active: function (e) { return e.isActive('codeBlock'); } },
        { id: 'hr', icon: '\u2500', title: 'Horizontal Rule', cmd: function (e) { e.chain().focus().setHorizontalRule().run(); } },
        { id: 'table', icon: '\u25A6', title: 'Insert Table', cmd: function (e) { e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); } },
      ],
    },
    {
      name: 'media',
      buttons: [
        { id: 'image', icon: '\uD83D\uDDBC', title: 'Insert Image', cmd: function (e) { showImageDialog(e); } },
        { id: 'link', icon: '\uD83D\uDD17', title: 'Insert Link (Ctrl+K)', cmd: function (e) { showLinkDialog(e); }, active: function (e) { return e.isActive('link'); } },
      ],
    },
    {
      name: 'advanced',
      buttons: [
        { id: 'toc', icon: 'TOC', title: 'Insert {{toc}}', cmd: function (e) { insertRedmineMacro(e, '{{toc}}'); } },
      ],
    },
    {
      name: 'view',
      buttons: [
        { id: 'togglemd', icon: 'MD', title: 'Toggle Markdown Source', cmd: function () { toggleMarkdownView(); } },
        { id: 'fullscreen', icon: '\u26F6', title: 'Fullscreen', cmd: function () { toggleFullscreen(); } },
      ],
    },
  ];

  // ── State ───────────────────────────────────────────────────────────
  var editor = null;
  var textarea = null;
  var editorWrap = null;
  var toolbarEl = null;
  var markdownView = false;
  var isFullscreen = false;
  var mdTextarea = null;

  // ── Initialization ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    textarea = document.getElementById('content_text');
    if (!textarea) return;

    // Build wrapper
    editorWrap = document.createElement('div');
    editorWrap.id = 'wiki-tiptap-wrap';
    textarea.parentNode.insertBefore(editorWrap, textarea);
    textarea.style.display = 'none';

    // Build toolbar
    toolbarEl = buildToolbar();
    editorWrap.appendChild(toolbarEl);

    // Editor container
    var editorContainer = document.createElement('div');
    editorContainer.id = 'wiki-tiptap-editor';
    editorWrap.appendChild(editorContainer);

    // Markdown source textarea (hidden by default)
    mdTextarea = document.createElement('textarea');
    mdTextarea.id = 'wiki-tiptap-md-source';
    mdTextarea.className = 'wiki-tiptap-md-source';
    mdTextarea.style.display = 'none';
    editorWrap.appendChild(mdTextarea);

    // Pre-process Redmine markdown
    var rawMd = textarea.value;
    var processedContent = WT.preProcessMarkdown(rawMd);

    // Initialize editor
    editor = new WT.Editor({
      element: editorContainer,
      extensions: [
        WT.StarterKit.configure({
          heading: { levels: [1, 2, 3, 4] },
        }),
        WT.Markdown.configure({
          html: true,
          tightLists: true,
          bulletListMarker: '-',
          linkify: true,
          breaks: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
        WT.Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
        }),
        WT.Image.configure({
          inline: true,
          allowBase64: false,
        }),
        WT.Table.configure({
          resizable: true,
        }),
        WT.TableRow,
        WT.TableCell,
        WT.TableHeader,
        WT.TaskList,
        WT.TaskItem.configure({
          nested: true,
        }),
        WT.Placeholder.configure({
          placeholder: 'Start writing...',
        }),
        WT.Typography,
        WT.RedmineMacroInline,
        WT.RedmineMacroBlock,
        WT.WikiLink,
        WT.IssueReference,
        WT.AttachmentImage,
      ],
      content: processedContent,
      autofocus: false,
      editorProps: {
        handleDrop: handleImageDrop,
        handlePaste: handlePaste,
      },
    });

    // Update toolbar active states on selection change
    editor.on('selectionUpdate', updateToolbarState);
    editor.on('transaction', updateToolbarState);

    // Sync to hidden textarea on form submit
    var form = textarea.closest('form');
    if (form) {
      form.addEventListener('submit', syncToTextarea);
    }

    // Table context buttons (show when cursor in table)
    addTableContextMenu();

    // Detect mermaid plugin
    detectMermaidPlugin();
  }

  // ── Toolbar ─────────────────────────────────────────────────────────
  function buildToolbar() {
    var toolbar = document.createElement('div');
    toolbar.className = 'wiki-tiptap-toolbar';

    TOOLBAR_GROUPS.forEach(function (group) {
      var groupEl = document.createElement('div');
      groupEl.className = 'wiki-tiptap-toolbar-group';

      group.buttons.forEach(function (btn) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'wiki-tiptap-btn';
        button.setAttribute('data-btn-id', btn.id);
        button.title = btn.title;
        // All icon content is hardcoded string literals, safe for textContent
        button.textContent = btn.icon;
        button.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (editor) btn.cmd(editor);
        });
        groupEl.appendChild(button);
      });

      toolbar.appendChild(groupEl);
    });

    return toolbar;
  }

  function updateToolbarState() {
    if (!editor || !toolbarEl) return;
    TOOLBAR_GROUPS.forEach(function (group) {
      group.buttons.forEach(function (btn) {
        if (!btn.active) return;
        var el = toolbarEl.querySelector('[data-btn-id="' + btn.id + '"]');
        if (el) {
          el.classList.toggle('is-active', btn.active(editor));
        }
      });
    });
  }

  // ── Markdown toggle ─────────────────────────────────────────────────
  function toggleMarkdownView() {
    markdownView = !markdownView;
    var editorEl = document.getElementById('wiki-tiptap-editor');

    if (markdownView) {
      var md = getMarkdownFromEditor();
      mdTextarea.value = md;
      editorEl.style.display = 'none';
      mdTextarea.style.display = 'block';
      mdTextarea.focus();
    } else {
      var updatedMd = mdTextarea.value;
      var processed = WT.preProcessMarkdown(updatedMd);
      editor.commands.setContent(processed);
      mdTextarea.style.display = 'none';
      editorEl.style.display = 'block';
      editor.commands.focus();
    }

    var btn = toolbarEl.querySelector('[data-btn-id="togglemd"]');
    if (btn) btn.classList.toggle('is-active', markdownView);
  }

  // ── Fullscreen ──────────────────────────────────────────────────────
  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    editorWrap.classList.toggle('wiki-tiptap-fullscreen', isFullscreen);
    document.body.classList.toggle('wiki-tiptap-body-fullscreen', isFullscreen);

    var btn = toolbarEl.querySelector('[data-btn-id="fullscreen"]');
    if (btn) btn.classList.toggle('is-active', isFullscreen);

    if (isFullscreen) {
      document.addEventListener('keydown', escFullscreen);
    } else {
      document.removeEventListener('keydown', escFullscreen);
    }
  }

  function escFullscreen(ev) {
    if (ev.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  }

  // ── Sync ────────────────────────────────────────────────────────────
  function getMarkdownFromEditor() {
    var md = editor.storage.markdown.getMarkdown();
    return WT.postProcessMarkdown(md);
  }

  function syncToTextarea() {
    if (markdownView) {
      textarea.value = mdTextarea.value;
    } else {
      textarea.value = getMarkdownFromEditor();
    }
  }

  // ── Image dialog ────────────────────────────────────────────────────
  function showImageDialog(ed) {
    var url = prompt('Image URL (or leave empty to upload a file):');
    if (url === null) return;

    if (url.trim()) {
      ed.chain().focus().setImage({ src: url.trim() }).run();
    } else {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', function () {
        if (input.files && input.files[0]) {
          uploadImage(input.files[0], ed);
        }
      });
      input.click();
    }
  }

  // ── Link dialog ─────────────────────────────────────────────────────
  function showLinkDialog(ed) {
    var prevUrl = ed.getAttributes('link').href || '';
    var url = prompt('Link URL:', prevUrl);
    if (url === null) return;

    if (url.trim() === '') {
      ed.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      ed.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  }

  // ── Insert Redmine macro ────────────────────────────────────────────
  function insertRedmineMacro(ed, macro) {
    ed.chain().focus().insertContent({
      type: 'redmineMacroInline',
      attrs: { macro: macro },
    }).run();
  }

  // ── Image upload (Redmine attachment API) ───────────────────────────
  function uploadImage(file, ed) {
    var csrfToken = getCSRFToken();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploads.json', true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('X-CSRF-Token', csrfToken);

    var progressEl = showUploadProgress();

    xhr.upload.addEventListener('progress', function (ev) {
      if (ev.lengthComputable) {
        var pct = Math.round((ev.loaded / ev.total) * 100);
        updateUploadProgress(progressEl, pct);
      }
    });

    xhr.addEventListener('load', function () {
      removeUploadProgress(progressEl);
      if (xhr.status === 201) {
        var resp = JSON.parse(xhr.responseText);
        var token = resp.upload.token;
        var filename = file.name;

        addAttachmentInput(token, filename, file.type);

        ed.chain().focus().setImage({
          src: filename,
          alt: filename,
          title: filename,
        }).run();
      } else {
        alert('Upload failed: ' + xhr.status);
      }
    });

    xhr.addEventListener('error', function () {
      removeUploadProgress(progressEl);
      alert('Upload error');
    });

    xhr.send(file);
  }

  function addAttachmentInput(token, filename, contentType) {
    var form = textarea.closest('form');
    if (!form) return;

    var idx = form.querySelectorAll('input[name^="attachments["]').length + 1;
    var prefix = 'attachments[p' + idx + ']';

    var fields = [
      { name: prefix + '[token]', value: token },
      { name: prefix + '[filename]', value: filename },
      { name: prefix + '[content_type]', value: contentType },
    ];

    fields.forEach(function (def) {
      var inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = def.name;
      inp.value = def.value;
      form.appendChild(inp);
    });
  }

  function getCSRFToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  // ── Upload progress indicator ───────────────────────────────────────
  function showUploadProgress() {
    var el = document.createElement('div');
    el.className = 'wiki-tiptap-upload-progress';

    var bar = document.createElement('div');
    bar.className = 'wiki-tiptap-upload-bar';
    bar.style.width = '0%';
    el.appendChild(bar);

    var label = document.createElement('span');
    label.textContent = 'Uploading... 0%';
    el.appendChild(label);

    editorWrap.appendChild(el);
    return el;
  }

  function updateUploadProgress(el, pct) {
    var bar = el.querySelector('.wiki-tiptap-upload-bar');
    var label = el.querySelector('span');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = 'Uploading... ' + pct + '%';
  }

  function removeUploadProgress(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ── Paste handling ──────────────────────────────────────────────────
  function handlePaste(view, event) {
    var items = event.clipboardData && event.clipboardData.items;
    if (!items) return false;

    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0) {
        event.preventDefault();
        var file = items[i].getAsFile();
        if (file) uploadImage(file, editor);
        return true;
      }
    }

    var text = event.clipboardData.getData('text/plain');
    if (text && isUrl(text) && !editor.state.selection.empty) {
      event.preventDefault();
      editor.chain().focus().setLink({ href: text.trim() }).run();
      return true;
    }

    return false;
  }

  // ── Drag & drop images ──────────────────────────────────────────────
  function handleImageDrop(view, event) {
    var files = event.dataTransfer && event.dataTransfer.files;
    if (!files || files.length === 0) return false;

    for (var i = 0; i < files.length; i++) {
      if (files[i].type.indexOf('image/') === 0) {
        event.preventDefault();
        uploadImage(files[i], editor);
        return true;
      }
    }

    return false;
  }

  // ── Table context menu ──────────────────────────────────────────────
  function addTableContextMenu() {
    editor.on('selectionUpdate', function () {
      var existing = editorWrap.querySelector('.wiki-tiptap-table-actions');
      if (editor.isActive('table')) {
        if (!existing) {
          var actions = document.createElement('div');
          actions.className = 'wiki-tiptap-table-actions';

          var tableButtons = [
            { label: '\u2191+', title: 'Add Row Before', action: 'addRowBefore' },
            { label: '\u2193+', title: 'Add Row After', action: 'addRowAfter' },
            { label: '\u2193\u00D7', title: 'Delete Row', action: 'deleteRow' },
            { label: '\u2190+', title: 'Add Column Before', action: 'addColBefore' },
            { label: '\u2192+', title: 'Add Column After', action: 'addColAfter' },
            { label: '\u2192\u00D7', title: 'Delete Column', action: 'deleteCol' },
            { label: '\u2717', title: 'Delete Table', action: 'deleteTable' },
          ];

          tableButtons.forEach(function (def) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.title = def.title;
            btn.setAttribute('data-action', def.action);
            btn.textContent = def.label;
            actions.appendChild(btn);
          });

          actions.addEventListener('click', function (ev) {
            var action = ev.target.getAttribute('data-action');
            if (!action) return;
            var cmds = {
              addRowBefore: function () { editor.chain().focus().addRowBefore().run(); },
              addRowAfter: function () { editor.chain().focus().addRowAfter().run(); },
              deleteRow: function () { editor.chain().focus().deleteRow().run(); },
              addColBefore: function () { editor.chain().focus().addColumnBefore().run(); },
              addColAfter: function () { editor.chain().focus().addColumnAfter().run(); },
              deleteCol: function () { editor.chain().focus().deleteColumn().run(); },
              deleteTable: function () { editor.chain().focus().deleteTable().run(); },
            };
            if (cmds[action]) cmds[action]();
          });
          editorWrap.appendChild(actions);
        }
      } else if (existing) {
        existing.remove();
      }
    });
  }

  // ── Mermaid plugin detection ────────────────────────────────────────
  function detectMermaidPlugin() {
    if (typeof window.mermaid !== 'undefined' || document.querySelector('script[src*="mermaid"]')) {
      var advGroup = toolbarEl.querySelectorAll('.wiki-tiptap-toolbar-group');
      if (advGroup[5]) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wiki-tiptap-btn';
        btn.setAttribute('data-btn-id', 'mermaid');
        btn.title = 'Insert Mermaid Diagram';
        btn.textContent = '\u25C7';
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          editor.chain().focus().setCodeBlock({ language: 'mermaid' }).run();
        });
        advGroup[5].appendChild(btn);
      }
    }
  }

  // ── Utility ─────────────────────────────────────────────────────────
  function isUrl(str) {
    return /^https?:\/\//i.test(str.trim());
  }
})();
