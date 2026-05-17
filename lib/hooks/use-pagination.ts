'use client';

import { useCallback, useMemo, useState } from 'react';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface UsePaginationOptions {
  initialPageIndex?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setPagination: (state: PaginationState) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function usePagination({
  initialPageIndex = 0,
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const setPageIndex = useCallback((index: number) => {
    setPaginationState((current) => ({ ...current, pageIndex: Math.max(0, index) }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPaginationState({
      pageIndex: 0,
      pageSize: Math.max(1, size),
    });
  }, []);

  const setPagination = useCallback((state: PaginationState) => {
    setPaginationState(state);
  }, []);

  const nextPage = useCallback(() => {
    setPaginationState((current) => ({ ...current, pageIndex: current.pageIndex + 1 }));
  }, []);

  const previousPage = useCallback(() => {
    setPaginationState((current) => ({
      ...current,
      pageIndex: Math.max(0, current.pageIndex - 1),
    }));
  }, []);

  const reset = useCallback(() => {
    setPaginationState({ pageIndex: initialPageIndex, pageSize: initialPageSize });
  }, [initialPageIndex, initialPageSize]);

  return useMemo(
    () => ({
      pagination,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      pageSizeOptions,
      setPageIndex,
      setPageSize,
      setPagination,
      nextPage,
      previousPage,
      reset,
    }),
    [
      pagination,
      pageSizeOptions,
      setPageIndex,
      setPageSize,
      setPagination,
      nextPage,
      previousPage,
      reset,
    ]
  );
}
