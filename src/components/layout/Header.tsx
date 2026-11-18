"use client";

import React from "react";
import { Menu, X, PanelLeftClose, PanelLeft, ShieldCheck, Activity } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { useSidebar } from "./sidebar-context";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: user } = useCurrentUser();
  const { isCollapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Query health endpoint every 60 seconds
  const { data: healthData, isError } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiClient.get<{ status: string }>("/health");
      return res.data;
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 1,
  });

  const isOnline = !isError && healthData?.status === "ok";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/90 px-4 sm:px-6 backdrop-blur-md shadow-raised-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-24" : "lg:pl-68"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile toggle button (round raised neumorphic) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex lg:hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-border bg-surface shadow-raised hover:shadow-raised-sm active:shadow-pressed cursor-pointer transition-all duration-150"
          aria-label={mobileOpen ? "Close navigation drawer" : "Open navigation drawer"}
          aria-expanded={mobileOpen}
          aria-controls="sidebar-navigation"
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>

        {/* Desktop sidebar toggle button (round raised neumorphic) */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-border bg-surface shadow-raised hover:shadow-raised-sm active:shadow-pressed cursor-pointer transition-all duration-150 group"
          aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-navigation"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4 text-foreground group-hover:text-primary transition-colors" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-foreground group-hover:text-primary transition-colors" />
          )}
        </button>

        {/* Mobile Clinic Brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-raised-sm">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            Doctor Tracker
          </span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Live system health status indicator: dot ONLY, no text */}
        <div
          className="flex items-center justify-center p-1.5 cursor-help"
          title={isOnline ? "API online" : "API unreachable"}
          aria-label={isOnline ? "API online" : "API unreachable"}
          role="status"
        >
          {isOnline ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success shadow-[0_0_8px_var(--color-success)]" />
            </span>
          ) : (
            <span className="flex h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_8px_var(--color-danger)]" />
          )}
          <span className="sr-only">{isOnline ? "API online" : "API unreachable"}</span>
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
