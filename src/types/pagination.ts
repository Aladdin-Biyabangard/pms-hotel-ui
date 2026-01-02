/**
 * Centralized pagination types matching the backend CustomPage structure
 */

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages?: number;
  totalElements?: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  hasNextPage?: boolean; // Alternative to totalPages when exact count is unknown
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
}
