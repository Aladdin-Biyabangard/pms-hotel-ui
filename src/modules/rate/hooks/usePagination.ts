import { useState, useCallback } from "react";
import { PaginationState } from "@/types/pagination";

export function useTablePagination(initialPage = 0, initialSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialSize,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(0, page),
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 0, // Reset to first page when changing page size
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 0,
    }));
  }, []);

  const updateTotalElements = useCallback((totalElements: number) => {
    setPagination(prev => ({
      ...prev,
      totalElements,
      totalPages: Math.ceil(totalElements / prev.pageSize),
    }));
  }, []);

  return {
    ...pagination,
    setPage,
    setPageSize,
    resetPagination,
    updateTotalElements,
  };
}
