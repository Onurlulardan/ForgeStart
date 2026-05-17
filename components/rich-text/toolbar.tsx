'use client';

import type { Editor } from '@tiptap/react';
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  Undo2Icon,
} from 'lucide-react';
import { useRef } from 'react';
import { uploadsApi } from '@/lib/api/client/uploads';
import { UploadKind } from '@/db/types';
import { LinkPopover } from './link-popover';
import { ToolbarButton } from './toolbar-button';

interface ToolbarProps {
  editor: Editor;
}

export function Toolbar({ editor }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const upload = await uploadsApi.upload(file, { kind: UploadKind.RICH_TEXT_IMAGE });
      const src = upload.publicUrl ?? `/api/uploads/${upload.id}`;
      editor.chain().focus().setImage({ src, alt: upload.originalName }).run();
    } catch (err) {
      console.error('[rich-text image upload]', err);
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        aria-label="Bold"
      >
        <BoldIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        aria-label="Italic"
      >
        <ItalicIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        aria-label="Strike"
      >
        <StrikethroughIcon className="size-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        aria-label="H1"
      >
        <Heading1Icon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        aria-label="H2"
      >
        <Heading2Icon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        aria-label="H3"
      >
        <Heading3Icon className="size-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        aria-label="Bullet list"
      >
        <ListIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        aria-label="Ordered list"
      >
        <ListOrderedIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        aria-label="Blockquote"
      >
        <QuoteIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        aria-label="Code block"
      >
        <CodeIcon className="size-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <LinkPopover editor={editor} />
      <ToolbarButton onClick={() => fileInputRef.current?.click()} aria-label="Image">
        <ImageIcon className="size-4" />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImage}
      />
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo2Icon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo2Icon className="size-4" />
      </ToolbarButton>
    </div>
  );
}
