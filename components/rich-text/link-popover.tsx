'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { LinkIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolbarButton } from './toolbar-button';

interface LinkPopoverProps {
  editor: Editor;
}

export function LinkPopover({ editor }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const apply = () => {
    const url = value.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setOpen(false);
    setValue('');
  };

  return (
    <div className="relative inline-flex">
      <ToolbarButton
        active={editor.isActive('link')}
        onClick={() => {
          const current = (editor.getAttributes('link').href as string | undefined) ?? '';
          setValue(current);
          setOpen((prev) => !prev);
        }}
        aria-label="Link"
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-2 w-72 rounded-lg border bg-popover p-3 shadow-md">
          <Input
            autoFocus
            placeholder="https://example.com"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
            }}
          />
          <div className="mt-2 flex justify-end gap-2">
            {editor.isActive('link') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setOpen(false);
                }}
              >
                <Trash2Icon />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
