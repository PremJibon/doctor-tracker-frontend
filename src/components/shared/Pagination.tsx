"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  totalPages: number;
  currentPage?: number;
  totalItems?: number;
  pageSize?: number;
  paramName?: string;
  onPageChange?: (page: number) => void;
  className?: string;
  showSummary?: boolean;
  hideOnSinglePage?: boolean;
}

export function Pagination({
  totalPages,
  currentPage: controlledCurrentPage,
  totalItems,
  pageSize,
  paramName = "page",
  onPageChange,
  className,
  showSummary = true,
  hideOnSinglePage = true,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlPage = parseInt(searchParams.get(paramName) || "1", 10);
  const activePage = controlledCurrentPage ?? (isNaN(urlPage) || urlPage < 1 ? 1 : urlPage);

  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const navigateToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === activePage) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete(paramName);
      } else {
        params.set(paramName, String(newPage));
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url, { scroll: false });
      onPageChange?.(newPage);
    });
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always show page 1
    pages.push(1);

    if (activePage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, activePage - 1);
    const end = Math.min(totalPages - 1, activePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (activePage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range summary if totalItems & pageSize are provided
  let summaryText = `Page ${activePage} of ${totalPages}`;
  if (totalItems !== undefined && pageSize !== undefined && totalItems > 0) {
    const from = (activePage - 1) * pageSize + 1;
    const to = Math.min(activePage * pageSize, totalItems);
    summaryText = `Showing ${from}–${to} of ${totalItems}`;
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 select-none",
        className
      )}
    >
      {/* Summary caption */}
      {showSummary && (
        <p className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          {summaryText}
        </p>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => navigateToPage(activePage - 1)}
          disabled={activePage <= 1}
          aria-label="Go to previous page"
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-md px-3 h-10 min-h-[40px] min-w-[40px] text-sm font-medium",
            "border border-border bg-surface text-foreground transition-colors",
            "hover:bg-surface-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers (visible on sm+) */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="flex h-10 min-h-[40px] w-10 min-w-[40px] items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const isCurrent = page === activePage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => navigateToPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex h-10 min-h-[40px] w-10 min-w-[40px] items-center justify-center rounded-md text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer",
                  isCurrent
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-border bg-surface text-foreground hover:bg-surface-muted"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile active indicator (compact for mobile screen < sm) */}
        <div className="flex sm:hidden items-center px-2 py-1 text-sm font-medium text-foreground">
          {activePage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => navigateToPage(activePage + 1)}
          disabled={activePage >= totalPages}
          aria-label="Go to next page"
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-md px-3 h-10 min-h-[40px] min-w-[40px] text-sm font-medium",
            "border border-border bg-surface text-foreground transition-colors",
            "hover:bg-surface-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
