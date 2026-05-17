'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ColorTokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function oklchToSwatch(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('oklch') || trimmed.startsWith('hsl') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return trimmed;
}

export function ColorTokenInput({ label, value, onChange }: ColorTokenInputProps) {
  return (
    <div className="grid grid-cols-[120px_36px_1fr] items-center gap-3">
      <Label className="truncate text-xs font-medium" title={label}>
        {label}
      </Label>
      <span
        aria-hidden
        className="size-9 rounded-md border"
        style={{ background: oklchToSwatch(value) }}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-xs"
      />
    </div>
  );
}
