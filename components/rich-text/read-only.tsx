import { cn } from '@/lib/utils';
import { sanitizeHtml } from './sanitize';

export interface RichTextReadOnlyProps {
  html: string;
  className?: string;
}

export function RichTextReadOnly({ html, className }: RichTextReadOnlyProps) {
  const safe = sanitizeHtml(html);
  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
