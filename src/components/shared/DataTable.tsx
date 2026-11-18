"use client";

import React, { useRef, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  mobileCardRenderer?: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;

  // Selection & Bulk Action Mode
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  bulkActions?: { label: string; value: string; variant?: "danger" | "default" }[];
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  isBulkPending?: boolean;
}

const MAX_SELECTION = 100;

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyState,
  mobileCardRenderer,
  onRowClick,
  className,
  selectable = false,
  selectedIds = new Set<string>(),
  onSelectionChange,
  bulkActions = [{ label: "Delete", value: "delete", variant: "danger" }],
  onBulkAction,
  isBulkPending = false,
}: DataTableProps<T>) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("delete");

  // IDs on current page
  const pageIds = React.useMemo(() => {
    return data.map((item, idx) => keyExtractor(item, idx));
  }, [data, keyExtractor]);

  // Determine header checkbox checked / indeterminate states
  const pageSelectedCount = pageIds.filter((id) => selectedIds.has(id)).length;
  const isAllPageSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const isIndeterminate = pageSelectedCount > 0 && pageSelectedCount < pageIds.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const toggleSelectAllPage = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);

    if (isAllPageSelected) {
      // Unselect all on this page
      pageIds.forEach((id) => next.delete(id));
    } else {
      // Select all on this page up to MAX_SELECTION
      let capped = false;
      for (const id of pageIds) {
        if (next.size >= MAX_SELECTION) {
          capped = true;
          break;
        }
        next.add(id);
      }
      if (capped) {
        toast.info("Selection limit reached", {
          description: `You can select a maximum of ${MAX_SELECTION} items at once.`,
        });
      }
    }
    onSelectionChange(next);
  };

  const handleRowCheckboxChange = (
    id: string,
    index: number,
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    if (!onSelectionChange) return;

    const next = new Set(selectedIds);
    const isShiftClick = e.shiftKey && lastSelectedIndex !== null;

    if (isShiftClick) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      let capped = false;

      for (let i = start; i <= end; i++) {
        const rowId = pageIds[i];
        if (next.size >= MAX_SELECTION && !next.has(rowId)) {
          capped = true;
          break;
        }
        next.add(rowId);
      }
      if (capped) {
        toast.info("Selection limit reached", {
          description: `You can select a maximum of ${MAX_SELECTION} items at once.`,
        });
      }
    } else {
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_SELECTION) {
          toast.info("Selection limit reached", {
            description: `You can select a maximum of ${MAX_SELECTION} items at once.`,
          });
          return;
        }
        next.add(id);
      }
    }

    setLastSelectedIndex(index);
    onSelectionChange(next);
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {/* Desktop skeleton table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface shadow-raised">
          <div className="border-b border-border bg-surface-muted px-4 py-3.5 flex gap-4">
            {selectable && <Skeleton className="h-4 w-5 rounded" />}
            {columns.map((col, idx) => (
              <div key={idx} className={cn("flex-1", col.headerClassName)}>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <div key={rIdx} className="px-4 py-4 flex gap-4 items-center">
                {selectable && <Skeleton className="h-4 w-5 rounded" />}
                {columns.map((col, cIdx) => (
                  <div key={cIdx} className={cn("flex-1", col.className)}>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile skeleton cards (<md) */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: skeletonRows }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface shadow-raised-sm p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-1/2" />
              <div className="pt-2 border-t border-border/60 flex justify-between">
                <Skeleton className="h-3.5 w-1/4" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-surface p-8 text-center text-sm text-muted-foreground shadow-sm">
        No records found.
      </div>
    );
  }

  // 3. Success State
  return (
    <div className={cn("w-full relative", className)}>
      {/* Desktop Table View (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-surface shadow-raised">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3.5 align-middle">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllPage}
                    aria-label="Select all rows on this page"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-1 cursor-pointer accent-primary"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              const isSelected = selectedIds.has(rowKey);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick?.(item);
                          }
                        }
                      : undefined
                  }
                  tabIndex={isClickable ? 0 : undefined}
                  role={isClickable ? "button" : undefined}
                  className={cn(
                    "transition-colors",
                    isSelected ? "bg-accent/40" : "",
                    isClickable
                      ? "cursor-pointer hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      : "hover:bg-surface-muted/30"
                  )}
                >
                  {selectable && (
                    <td
                      className="w-12 px-4 py-3.5 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => handleRowCheckboxChange(rowKey, index, e)}
                        onChange={() => {}} // Controlled by onClick
                        aria-label={`Select row ${index + 1}`}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-1 cursor-pointer accent-primary"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(item, index)
                      : (item as Record<string, unknown>)[col.key] !== undefined
                      ? String((item as Record<string, unknown>)[col.key])
                      : null;

                    return (
                      <td
                        key={`${rowKey}-${col.key}`}
                        className={cn(
                          "px-4 py-3.5 text-sm text-foreground align-middle",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (<md) */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const itemKey = keyExtractor(item, index);
          const isSelected = selectedIds.has(itemKey);

          return (
            <div
              key={itemKey}
              onClick={() => onRowClick?.(item)}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick?.(item);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              className={cn(
                "rounded-xl border border-border bg-surface p-4 shadow-raised-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
                isSelected && "border-primary/60 bg-accent/20",
                onRowClick && "cursor-pointer active:shadow-pressed"
              )}
            >
              {/* Mobile Card Checkbox Header if selectable */}
              {selectable && (
                <div
                  className="flex items-center justify-between pb-2 mb-2 border-b border-border/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => handleRowCheckboxChange(itemKey, index, e)}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span>Select</span>
                  </label>
                  {isSelected && (
                    <span className="text-[11px] font-medium text-primary">Selected</span>
                  )}
                </div>
              )}

              {mobileCardRenderer ? (
                mobileCardRenderer(item, index)
              ) : (
                <div className="space-y-2.5">
                  {columns
                    .filter((col) => !col.hideOnMobile)
                    .map((col) => {
                      const content = col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] !== undefined
                        ? String((item as Record<string, unknown>)[col.key])
                        : null;

                      return (
                        <div
                          key={`${itemKey}-${col.key}`}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {col.header}
                          </span>
                          <span className="text-right text-sm font-medium text-foreground">
                            {content}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky WordPress-Style Floating Bulk Action Bar */}
      {selectable && selectedIds.size > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions toolbar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-raised duration-200 animate-in slide-in-from-bottom-5 max-w-[95vw] overflow-x-auto"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
              {selectedIds.size}
            </span>
            <span className="hidden sm:inline">selected</span>
            {selectedIds.size >= MAX_SELECTION && (
              <span className="text-[11px] text-danger font-normal">(capped at 100)</span>
            )}
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Action Select Menu */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-9 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-h-[36px]"
            aria-label="Choose bulk action"
          >
            {bulkActions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          {/* Apply Button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!selectedAction || isBulkPending}
            onClick={() => {
              if (selectedAction) {
                onBulkAction?.(selectedAction, Array.from(selectedIds));
              }
            }}
            className="h-9 px-3.5 text-xs rounded-xl shadow-raised min-h-[36px]"
          >
            {isBulkPending ? "Applying..." : "Apply"}
          </Button>

          {/* Clear Selection Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange?.(new Set())}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl min-h-[36px]"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
