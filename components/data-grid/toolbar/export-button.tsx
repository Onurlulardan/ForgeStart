'use client';

import { DownloadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExportCsv: () => void;
  onExportXlsx: () => void;
}

export function ExportButton({ onExportCsv, onExportXlsx }: ExportButtonProps) {
  const t = useTranslations('dataGrid');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <DownloadIcon />
        {t('export')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onExportCsv}>{t('exportCsv')}</DropdownMenuItem>
          <DropdownMenuItem onClick={onExportXlsx}>{t('exportXlsx')}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
