'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useThemeCustomizer } from '@/contexts/ThemeCustomizerContext';

const FONT_STACKS = [
  {
    label: 'Inter (default)',
    value:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    label: 'System UI',
    value:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Geist',
    value: '"Geist", "Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    label: 'IBM Plex Sans',
    value: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
  },
  {
    label: 'Mono',
    value: 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace',
  },
];

export function FontSelector() {
  const t = useTranslations('admin.theme');
  const { tokens, setFontFamily } = useThemeCustomizer();
  const active = FONT_STACKS.find((font) => font.value === tokens.fontFamily) ?? FONT_STACKS[0];
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">{t('fontFamily')}</Label>
      <Select
        value={tokens.fontFamily}
        onValueChange={(value) => {
          if (typeof value === 'string') setFontFamily(value);
        }}
      >
        <SelectTrigger className="w-full">{active.label}</SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {FONT_STACKS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
