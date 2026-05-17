'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeCustomizer } from '@/contexts/ThemeCustomizerContext';

const PRESETS = ['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.25rem'];

export function RadiusSlider() {
  const { tokens, setRadius } = useThemeCustomizer();
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">Radius</Label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRadius(value)}
            className={`rounded-md border px-3 py-1 text-xs ${
              tokens.radius === value ? 'border-primary bg-primary/10' : 'border-input'
            }`}
            style={{ borderRadius: value }}
          >
            {value}
          </button>
        ))}
      </div>
      <Input
        value={tokens.radius}
        onChange={(event) => setRadius(event.target.value)}
        className="font-mono text-xs"
      />
    </div>
  );
}
