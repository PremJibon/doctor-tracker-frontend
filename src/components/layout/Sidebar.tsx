"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Activity,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogoutMutation, useCurrentUser } from "@/features/auth/hooks";
import { useSidebar } from "./sidebar-context";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Doctors",
    href: "/doctors",
    icon: Stethoscope,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();
  const { data: user } = useCurrentUser();
  const { isCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderNavItems = (collapsed: boolean) => (
    <nav className="space-y-1.5 pt-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 select-none min-h-[40px]",
              collapsed ? "justify-center px-0" : "gap-3",
              isActive
                ? "bg-surface shadow-inset text-primary border border-border/50 font-semibold"
                : "text-muted-foreground hover:bg-surface-muted hover:shadow-raised-sm hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        id="sidebar-navigation"
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col border-r border-border bg-surface text-foreground shadow-raised transition-all duration-300 ease-in-out select-none",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Brand Header */}
            <div className={cn("flex items-center pt-2", isCollapsed ? "justify-center" : "px-2 justify-between")}>
              <Link
                href="/dashboard"
                className={cn("flex items-center font-semibold text-lg text-foreground group", isCollapsed ? "justify-center" : "gap-3")}
                title="Doctor Tracker"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-raised hover:bg-primary-hover transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="leading-tight font-bold tracking-tight text-foreground truncate">
                      Doctor Tracker
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal truncate">
                      Soft Clinical Suite
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Nav list */}
            {renderNavItems(isCollapsed)}
          </div>

          {/* Footer User Profile & Logout */}
          <div className="border-t border-border/60 pt-4 pb-2 space-y-3">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 px-2")}>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-raised-sm border border-border text-primary font-bold text-xs"
                title={user?.email || "Administrator"}
              >
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {user?.name || "Administrator"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user?.email || "admin@clinic.com"}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "flex items-center rounded-xl py-2 text-xs font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger hover:shadow-raised-sm active:shadow-pressed transition-all duration-150 cursor-pointer min-h-[40px]",
                isCollapsed ? "w-full justify-center px-0" : "w-full gap-3 px-3"
              )}
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4 shrink-0 text-danger" />
              {!isCollapsed && (
                <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer (<lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="sidebar-navigation-mobile"
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-surface text-foreground shadow-raised p-4 flex flex-col justify-between transition-transform duration-300 animate-in slide-in-from-left"
          >
            <div className="space-y-6">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between px-2 pt-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 font-semibold text-lg text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-raised">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-bold tracking-tight text-foreground">
                      Doctor Tracker
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Soft Clinical Suite
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface shadow-raised hover:shadow-raised-sm active:shadow-pressed text-foreground cursor-pointer transition-all"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              {renderNavItems(false)}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 pt-4 pb-2 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-raised-sm border border-border text-primary font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {user?.name || "Administrator"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user?.email || "admin@clinic.com"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger hover:shadow-raised-sm active:shadow-pressed transition-all duration-150 cursor-pointer min-h-[40px]"
              >
                <LogOut className="h-4 w-4 shrink-0 text-danger" />
                <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
