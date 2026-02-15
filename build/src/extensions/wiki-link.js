import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Handles Redmine wiki links: [[PageName]] and [[PageName|Display Text]]
 * Treated as atomic inline nodes preserved during roundtrip.
 */
export const WikiLink = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      raw: { default: '' },
      page: { default: '' },
      display: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
        getAttrs: (el) => ({
          raw: el.getAttribute('data-wiki-link'),
          page: el.getAttribute('data-wiki-page'),
          display: el.getAttribute('data-wiki-display') || null,
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const displayText = node.attrs.display || node.attrs.page;
    return [
      'span',
      mergeAttributes({
        'data-wiki-link': node.attrs.raw,
        'data-wiki-page': node.attrs.page,
        'data-wiki-display': node.attrs.display || '',
        class: 'wiki-link-node',
      }),
      displayText,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(node.attrs.raw);
        },
        parse: {
          // Handled by pre/post processing in index.js
        },
      },
    };
  },
});
