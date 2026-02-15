import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Handles Redmine attachment syntax: attachment:filename.png
 * Treated as atomic inline node preserved during roundtrip.
 */
export const AttachmentImage = Node.create({
  name: 'attachmentImage',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      raw: { default: '' },
      filename: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-attachment]',
        getAttrs: (el) => ({
          raw: el.getAttribute('data-attachment'),
          filename: el.getAttribute('data-filename'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      mergeAttributes({
        'data-attachment': node.attrs.raw,
        'data-filename': node.attrs.filename,
        class: 'attachment-node',
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
