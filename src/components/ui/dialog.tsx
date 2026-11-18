"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

// Hydration-safe client-mount detection (no useEffect setState)
const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMounted = useIsMounted();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const dialogTree = (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );

  if (isMounted && typeof document !== "undefined") {
    return createPortal(dialogTree, document.body);
  }

  return dialogTree;
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");

  return (
    /*
     * Scroll pattern:
     * - Outer: fixed full-screen, overflow-y-auto, py padding for breathing room
     * - Inner wrapper: min-h-full flex items-center justify-center — centres the
     *   dialog when content is short, lets it push taller when content overflows.
     * - Dialog card: NO overflow on itself; grows naturally with content.
     */
    <div className="fixed inset-0 z-50 overflow-y-auto py-6 px-3 sm:px-4 md:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => context.onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Centre wrapper — min-h ensures vertical centering for short forms */}
      <div className="relative z-50 min-h-full flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            // 60 % of viewport on desktop (min 320px, max 640px default)
            "relative w-full max-w-[min(60vw,640px)] min-w-[min(100%,320px)]",
            "rounded-xl border border-border bg-surface shadow-raised",
            "p-5 sm:p-6 my-6",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            className
          )}
        >
          <button
            type="button"
            onClick={() => context.onOpenChange(false)}
            className="absolute right-3 top-3 h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground hover:shadow-raised-sm active:shadow-pressed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-all z-10"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-4 pr-8", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs sm:text-sm text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 mt-6 pt-4 border-t border-border-subtle/40",
        className
      )}
      {...props}
    />
  );
}
