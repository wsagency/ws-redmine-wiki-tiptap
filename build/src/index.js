import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';

import { RedmineMacroInline, RedmineMacroBlock } from './extensions/redmine-macro.js';
import { WikiLink } from './extensions/wiki-link.js';
import { IssueReference } from './extensions/issue-reference.js';
import { AttachmentImage } from './extensions/attachment-image.js';
import { preProcessMarkdown, postProcessMarkdown } from './redmine-markdown.js';

// Export everything needed by wiki_tiptap_init.js
export {
  Editor,
  StarterKit,
  Link,
  Image,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem,
  Placeholder,
  Typography,
  Markdown,
  RedmineMacroInline,
  RedmineMacroBlock,
  WikiLink,
  IssueReference,
  AttachmentImage,
  preProcessMarkdown,
  postProcessMarkdown,
};
