"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation inside Suspense for usePathname */}
      <Suspense
        fallback={
          <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-surface border-r border-border" />
        }
      >
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />

        <main
          className={cn(
            "flex-1 w-full transition-all duration-300 ease-in-out",
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <div className="h-8 w-48 rounded-xl bg-surface-muted shadow-inset animate-pulse" />
                  <div className="h-64 rounded-xl bg-surface border border-border shadow-raised animate-pulse" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "/dashboard";
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, router]);

  // Loading state while verifying authentication session
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border shadow-raised text-primary animate-bounce">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-32 rounded-lg bg-surface-muted shadow-inset animate-pulse mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              Verifying clinical access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, render null while redirect triggers
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </SidebarProvider>
  );
}
