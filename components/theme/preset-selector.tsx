'use client';

import { Button } from '@/components/ui/button';
import { THEME_PRESETS } from '@/lib/theme';
import { useThemeCustomizer } from '@/contexts/ThemeCustomizerContext';

export function PresetSelector() {
  const { applyTokens, tokens } = useThemeCustomizer();
  const currentPrimaryLight = tokens.colors.light.primary;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {THEME_PRESETS.map((preset) => {
        const active = preset.tokens.colors.light.primary === currentPrimaryLight;
        return (
          <Button
            key={preset.id}
            type="button"
            variant={active ? 'default' : 'outline'}
            className="flex h-auto flex-col items-start gap-2 px-3 py-3"
            onClick={() => applyTokens(preset.tokens)}
          >
            <div className="flex w-full items-center gap-2">
              <span
                className="size-6 shrink-0 rounded-md"
                style={{ background: preset.tokens.colors.light.primary }}
              />
              <span className="text-sm font-medium">{preset.name}</span>
            </div>
            <div className="grid w-full grid-cols-4 gap-1">
              {(['background', 'accent', 'destructive', 'sidebar'] as const).map((token) => (
                <span
                  key={token}
                  className="h-3 rounded-sm"
                  style={{ background: preset.tokens.colors.light[token] }}
                />
              ))}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
