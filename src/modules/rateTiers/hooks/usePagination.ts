import {useState} from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export const usePagination = ({
  initialPage = 0,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100]
}: PaginationOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginateData = <T>(data: T[]) => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = data.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPreviousPage: currentPage > 0,
      startIndex,
      endIndex,
    };
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, page));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const resetPagination = () => {
    setCurrentPage(0);
  };

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginateData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    resetPagination,
    setCurrentPage,
    setPageSize,
  };
};
