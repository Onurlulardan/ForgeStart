import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:f|ht)tps?|mailto|tel|data:image\/(?:png|jpeg|gif|webp)):/i,
  });
}
