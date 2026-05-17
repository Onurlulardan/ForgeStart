'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useConfirm } from './use-confirm';
import { useDisclosure } from './use-disclosure';
import { useResourcePermissions, type ResourcePermissionFlags } from './use-resource-permissions';

export interface UseCrudResourceOptions<TItem> {
  resource: string;
  organizationId?: string;
  onDelete?: (item: TItem) => void | Promise<void>;
  deleteConfirm?: {
    title?: ReactNode;
    description?: ReactNode | ((item: TItem) => ReactNode);
    confirmLabel?: string;
  };
}

export interface UseCrudResourceReturn<TItem> {
  selected: TItem | null;
  isFormOpen: boolean;
  permissions: ResourcePermissionFlags;
  openCreate: () => void;
  openEdit: (item: TItem) => void;
  closeForm: () => void;
  setSelected: (item: TItem | null) => void;
  confirmDelete: (item: TItem) => Promise<boolean>;
}

export function useCrudResource<TItem>({
  resource,
  organizationId,
  onDelete,
  deleteConfirm,
}: UseCrudResourceOptions<TItem>): UseCrudResourceReturn<TItem> {
  const t = useTranslations('common');
  const confirm = useConfirm();
  const permissions = useResourcePermissions(resource, organizationId);
  const form = useDisclosure(false);
  const [selected, setSelected] = useState<TItem | null>(null);

  const openCreate = useCallback(() => {
    setSelected(null);
    form.open();
  }, [form]);

  const openEdit = useCallback(
    (item: TItem) => {
      setSelected(item);
      form.open();
    },
    [form]
  );

  const closeForm = useCallback(() => {
    form.close();
    setSelected(null);
  }, [form]);

  const confirmDelete = useCallback(
    async (item: TItem): Promise<boolean> => {
      const description =
        typeof deleteConfirm?.description === 'function'
          ? deleteConfirm.description(item)
          : deleteConfirm?.description;

      const accepted = await confirm({
        title: deleteConfirm?.title ?? t('delete'),
        description,
        confirmLabel: deleteConfirm?.confirmLabel ?? t('delete'),
        variant: 'destructive',
      });

      if (accepted && onDelete) {
        await onDelete(item);
      }

      return accepted;
    },
    [confirm, deleteConfirm, onDelete, t]
  );

  return {
    selected,
    isFormOpen: form.isOpen,
    permissions,
    openCreate,
    openEdit,
    closeForm,
    setSelected,
    confirmDelete,
  };
}
