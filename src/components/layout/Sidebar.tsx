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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();
  const { data: user } = useCurrentUser();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-sidebar text-sidebar-foreground p-4">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-semibold text-lg text-sidebar-foreground group"
            onClick={onMobileClose}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-bold tracking-tight">Doctor Tracker</span>
              <span className="text-[11px] text-sidebar-muted font-normal">Clinical Suite</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 text-sidebar-muted hover:text-sidebar-foreground rounded-md cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 pt-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-sidebar-active text-sidebar-foreground shadow-xs"
                    : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-accent" : "text-sidebar-muted")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-sidebar-active/80 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sidebar-foreground font-medium text-xs">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-xs font-medium text-sidebar-foreground">
              {user?.name || "Administrator"}
            </span>
            <span className="truncate text-[11px] text-sidebar-muted">
              {user?.email || "admin@clinic.com"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-muted hover:bg-danger/20 hover:text-danger transition-colors cursor-pointer select-none"
        >
          <LogOut className="h-4 w-4" />
          <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col shadow-md">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer (<lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 shadow-2xl transition-transform duration-300 animate-in slide-in-from-left">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
