import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {typeof totalItems === 'number' && typeof pageSize === 'number' ? (
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          type="button"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          type="button"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
