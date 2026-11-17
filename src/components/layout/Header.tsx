"use client";

import React from "react";
import { Menu, Activity, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/95 px-4 sm:px-6 backdrop-blur-sm shadow-xs lg:pl-70">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle (touch target >= 40px) */}
        <button
          onClick={onMobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground hover:bg-surface-muted lg:hidden cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Clinic Brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            Doctor Tracker
          </span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Live system health indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* User preview */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="hidden md:inline font-medium text-foreground">
            {user?.email || "Authenticated Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
