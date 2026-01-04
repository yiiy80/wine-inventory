import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = false,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  const getVisiblePages = () => {
    const delta = 2; // 当前页前后显示的页数
    const range = [];
    const rangeWithDots = [];

    // 生成页码范围
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getItemRange = () => {
    if (!showInfo || !totalItems || !itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `${startItem}-${endItem} / ${totalItems}`;
  };

  if (totalPages <= 1) {
    return showInfo ? (
      <div className={`flex justify-between items-center ${className}`}>
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {getItemRange()}
        </span>
      </div>
    ) : null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}
    >
      {/* 信息显示 */}
      {showInfo && (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark order-2 sm:order-1">
          {getItemRange()}
        </span>
      )}

      {/* 分页控件 */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* 上一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2"
          aria-label="上一页"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 页码 */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <div className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                </div>
              ) : (
                <Button
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[2.5rem] ${
                    page === currentPage
                      ? ""
                      : "hover:bg-surface-dark dark:hover:bg-surface-light"
                  }`}
                  aria-label={`第 ${page} 页`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 下一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2"
          aria-label="下一页"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
