import 'server-only';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

export async function renderToHtml(element: ReactElement): Promise<string> {
  return render(element);
}

export async function renderToText(element: ReactElement): Promise<string> {
  return render(element, { plainText: true });
}
