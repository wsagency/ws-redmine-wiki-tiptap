import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Handles Redmine macros like {{toc}}, {{child_pages}}, {{include(page)}},
 * and paired macros like {{collapse(title)}}...{{/collapse}}.
 *
 * These are treated as atomic nodes — displayed visually but not editable.
 * On serialization they output exactly as they were.
 */

// Inline macro node for single macros: {{toc}}, {{child_pages}}, {{include(page)}}
export const RedmineMacroInline = Node.create({
  name: 'redmineMacroInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      macro: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-redmine-macro]',
        getAttrs: (el) => ({ macro: el.getAttribute('data-redmine-macro') }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      mergeAttributes({
        'data-redmine-macro': node.attrs.macro,
        class: 'redmine-macro-pill',
        contenteditable: 'false',
      }),
      node.attrs.macro,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(node.attrs.macro);
        },
        parse: {
          // Handled by pre/post processing in index.js
        },
      },
    };
  },
});

// Block macro node for paired macros: {{collapse(title)}}content{{/collapse}}
export const RedmineMacroBlock = Node.create({
  name: 'redmineMacroBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      macro: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-redmine-macro-block]',
        getAttrs: (el) => ({ macro: el.getAttribute('data-redmine-macro-block') }),
      },
    ];
  },

  renderHTML({ node }) {
    // Show a preview of the macro content
    const preview = node.attrs.macro.length > 80
      ? node.attrs.macro.substring(0, 80) + '...'
      : node.attrs.macro;

    return [
      'div',
      mergeAttributes({
        'data-redmine-macro-block': node.attrs.macro,
        class: 'redmine-macro-block-pill',
        contenteditable: 'false',
      }),
      preview,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(node.attrs.macro);
          state.closeBlock(node);
        },
        parse: {
          // Handled by pre/post processing in index.js
        },
      },
    };
  },
});
