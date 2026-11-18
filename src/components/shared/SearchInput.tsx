"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  paramName?: string;
  debounceMs?: number;
  resetPageParam?: string;
  onChange?: (value: string) => void;
  className?: string;
  containerClassName?: string;
}

export function SearchInput({
  paramName = "search",
  debounceMs = 400,
  resetPageParam = "page",
  onChange,
  className,
  containerClassName,
  placeholder = "Search...",
  disabled = false,
  ...props
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearchValue = searchParams.get(paramName) || "";
  const [value, setValue] = useState(currentSearchValue);
  const [prevSearchParam, setPrevSearchParam] = useState(currentSearchValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Sync internal state during render when URL parameter changes externally
  if (prevSearchParam !== currentSearchValue) {
    setPrevSearchParam(currentSearchValue);
    setValue(currentSearchValue);
  }

  // Debounce sync to URL
  useEffect(() => {
    // Avoid running on the very first mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // If internal value matches current URL param, no update needed
    if (value === currentSearchValue) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = value.trim();

        if (trimmed) {
          params.set(paramName, trimmed);
        } else {
          params.delete(paramName);
        }

        // UI Rule: changing search/filter resets page to 1
        if (resetPageParam) {
          params.delete(resetPageParam);
        }

        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(url, { scroll: false });
        onChange?.(trimmed);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    value,
    currentSearchValue,
    debounceMs,
    paramName,
    resetPageParam,
    pathname,
    router,
    searchParams,
    onChange,
  ]);

  const handleClear = () => {
    setValue("");
    onChange?.("");

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramName);
      if (resetPageParam) {
        params.delete(resetPageParam);
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url, { scroll: false });
    });

    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full min-h-[40px]",
        containerClassName
      )}
    >
      <div
        className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground"
        aria-hidden="true"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClear();
          }
          props.onKeyDown?.(e);
        }}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={props["aria-label"] || placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-surface pl-9 pr-9 py-2 text-base md:text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px]",
          className
        )}
        {...props}
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
