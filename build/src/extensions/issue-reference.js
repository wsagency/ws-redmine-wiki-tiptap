import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Handles Redmine issue references: #123, #4567
 * Treated as atomic inline nodes preserved during roundtrip.
 */
export const IssueReference = Node.create({
  name: 'issueReference',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      raw: { default: '' },
      issueId: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-issue-ref]',
        getAttrs: (el) => ({
          raw: el.getAttribute('data-issue-ref'),
          issueId: el.getAttribute('data-issue-id'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      mergeAttributes({
        'data-issue-ref': node.attrs.raw,
        'data-issue-id': node.attrs.issueId,
        class: 'issue-ref-node',
      }),
      node.attrs.raw,
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
