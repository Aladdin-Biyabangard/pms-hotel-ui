import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { PaginationProps } from "@/types/pagination";

export function Pagination({
  currentPage,
  totalPages = 1,
  hasNextPage,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = "flex items-center justify-between",
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (totalPages > 1 && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    } else if (hasNextPage !== undefined && hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    if (!showPageNumbers || totalPages <= 1) return null;

    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 0) {
      pages.push(
        <Button
          key={0}
          variant={currentPage === 0 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(0)}
        >
          1
        </Button>
      );
      if (startPage > 1) {
        pages.push(
          <Button key="start-ellipsis" variant="ghost" size="sm" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(i)}
        >
          {i + 1}
        </Button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <Button key="end-ellipsis" variant="ghost" size="sm" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }
      pages.push(
        <Button
          key={totalPages - 1}
          variant={currentPage === totalPages - 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(totalPages - 1)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  if (totalPages <= 1 && hasNextPage === false) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={(totalPages > 1 && currentPage >= totalPages - 1) || (hasNextPage === false)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
}

// Keep the old shadcn/ui style components for backward compatibility
import * as React from "react";
import {cn} from "@/lib/utils";
import {ButtonProps, buttonVariants} from "@/components/ui/button";

const PaginationNav = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
PaginationNav.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationNav,
};
