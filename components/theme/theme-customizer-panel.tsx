'use client';

import {
  DownloadIcon,
  Loader2Icon,
  RotateCcwIcon,
  SaveIcon,
  ServerCogIcon,
  UploadIcon,
} from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TOKEN_GROUPS, type ColorTokenKey } from '@/lib/theme';
import { useThemeCustomizer } from '@/contexts/ThemeCustomizerContext';
import { resetSystemThemeAction, saveSystemThemeAction } from '@/app/actions/theme';
import { ColorTokenInput } from './color-token-input';
import { FontSelector } from './font-selector';
import { PresetSelector } from './preset-selector';
import { RadiusSlider } from './radius-slider';
import { ThemePreview } from './theme-preview';

function downloadJson(json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'theme.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function ThemeCustomizerPanel() {
  const tTheme = useTranslations('admin.theme');
  const tFeedback = useTranslations('feedback');
  const { tokens, mode, setColorToken, reset, exportJson, importJson } = useThemeCustomizer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingSystem, startSavingSystem] = useTransition();
  const [resettingSystem, startResettingSystem] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      importJson(text);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : tFeedback('themeImportFailed'));
    }
  };

  const handleSaveSystem = () => {
    startSavingSystem(async () => {
      const result = await saveSystemThemeAction(tokens);
      if (result.ok) {
        toast.success(tFeedback('themeSaved'));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleResetSystem = () => {
    startResettingSystem(async () => {
      const result = await resetSystemThemeAction();
      if (result.ok) {
        toast.success(tFeedback('themeReset'));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{tTheme('presets')}</h3>
            <span className="text-xs text-muted-foreground">{tTheme('presetsHint')}</span>
          </div>
          <PresetSelector />
        </section>

        <Tabs defaultValue={mode}>
          <TabsList>
            <TabsTrigger value="light">{tTheme('tabs.light')}</TabsTrigger>
            <TabsTrigger value="dark">{tTheme('tabs.dark')}</TabsTrigger>
            <TabsTrigger value="typography">{tTheme('tabs.typography')}</TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="mt-4 space-y-6">
            {TOKEN_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2 rounded-lg border p-4">
                <h4 className="text-sm font-semibold">{group.label}</h4>
                <div className="grid gap-2">
                  {group.keys.map((key) => (
                    <ColorTokenInput
                      key={key}
                      label={key}
                      value={tokens.colors.light[key as ColorTokenKey]}
                      onChange={(value) => setColorToken('light', key as ColorTokenKey, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="dark" className="mt-4 space-y-6">
            {TOKEN_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2 rounded-lg border p-4">
                <h4 className="text-sm font-semibold">{group.label}</h4>
                <div className="grid gap-2">
                  {group.keys.map((key) => (
                    <ColorTokenInput
                      key={key}
                      label={key}
                      value={tokens.colors.dark[key as ColorTokenKey]}
                      onChange={(value) => setColorToken('dark', key as ColorTokenKey, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="typography" className="mt-4 space-y-4 rounded-lg border p-4">
            <FontSelector />
            <RadiusSlider />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSaveSystem} disabled={savingSystem}>
            {savingSystem ? <Loader2Icon className="animate-spin" /> : <ServerCogIcon />}
            {tTheme('actions.saveSystem')}
          </Button>
          <Button variant="outline" onClick={handleResetSystem} disabled={resettingSystem}>
            {resettingSystem ? <Loader2Icon className="animate-spin" /> : <RotateCcwIcon />}
            {tTheme('actions.resetSystem')}
          </Button>
          <Button variant="outline" onClick={() => downloadJson(exportJson())}>
            <DownloadIcon /> {tTheme('actions.exportJson')}
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <UploadIcon /> {tTheme('actions.importJson')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="destructive" onClick={reset}>
            <SaveIcon /> {tTheme('actions.resetLocal')}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <ThemePreview />
    </div>
  );
}
