/**
 * Pre/post processing for Redmine-specific Markdown syntax.
 *
 * Before feeding Markdown to Tiptap, we replace Redmine-specific constructs
 * with HTML placeholders that our custom nodes understand. On serialization,
 * we reverse the process.
 */

// Placeholder prefix to avoid collisions
const PH = '\u200B\u200B';

// Patterns for Redmine constructs
const MACRO_BLOCK_RE = /(\{\{collapse\([^)]*\)\}\}[\s\S]*?\{\{\/collapse\}\})/g;
const MACRO_INLINE_RE = /(\{\{(?:toc|child_pages|include\([^)]*\)|[a-z_]+(?:\([^)]*\))?)\}\})/g;
const WIKI_LINK_RE = /(\[\[([^\]|]+)(?:\|([^\]]+))?\]\])/g;
const ISSUE_REF_RE = /(?<=\s|^)(#(\d+))(?=\s|[.,;:!?]|$)/gm;
const ATTACHMENT_RE = /(attachment:([a-zA-Z0-9_.\-]+))/g;

/**
 * Convert Redmine Markdown to Tiptap-compatible HTML placeholders.
 */
export function preProcessMarkdown(md) {
  let result = md;

  // 1. Block macros (must come before inline macros)
  result = result.replace(MACRO_BLOCK_RE, (match) => {
    const escaped = escapeHtml(match);
    return `<div data-redmine-macro-block="${escaped}" class="redmine-macro-block-pill">${escapeHtml(match.substring(0, 80))}</div>`;
  });

  // 2. Inline macros
  result = result.replace(MACRO_INLINE_RE, (match) => {
    const escaped = escapeHtml(match);
    return `<span data-redmine-macro="${escaped}" class="redmine-macro-pill">${escaped}</span>`;
  });

  // 3. Wiki links [[Page]] or [[Page|Display]]
  result = result.replace(WIKI_LINK_RE, (match, raw, page, display) => {
    const escapedRaw = escapeHtml(raw);
    const escapedPage = escapeHtml(page);
    const escapedDisplay = display ? escapeHtml(display) : '';
    const displayText = escapedDisplay || escapedPage;
    return `<span data-wiki-link="${escapedRaw}" data-wiki-page="${escapedPage}" data-wiki-display="${escapedDisplay}" class="wiki-link-node">${displayText}</span>`;
  });

  // 4. Issue references #123
  result = result.replace(ISSUE_REF_RE, (match, raw, id) => {
    return `<span data-issue-ref="${escapeHtml(raw)}" data-issue-id="${escapeHtml(id)}" class="issue-ref-node">${escapeHtml(raw)}</span>`;
  });

  // 5. Attachment references
  result = result.replace(ATTACHMENT_RE, (match, raw, filename) => {
    return `<span data-attachment="${escapeHtml(raw)}" data-filename="${escapeHtml(filename)}" class="attachment-node">${escapeHtml(raw)}</span>`;
  });

  return result;
}

/**
 * Post-process Tiptap Markdown output to restore Redmine syntax.
 * The custom nodes serialize themselves, but we may need cleanup.
 */
export function postProcessMarkdown(md) {
  // Clean up any escaped double braces
  let result = md;
  result = result.replace(/\\{\\{/g, '{{');
  result = result.replace(/\\}\\}/g, '}}');
  result = result.replace(/\\\[\\\[/g, '[[');
  result = result.replace(/\\\]\\\]/g, ']]');
  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
