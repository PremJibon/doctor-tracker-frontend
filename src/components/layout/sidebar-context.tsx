"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const STORAGE_KEY = "doctor-tracker:sidebar-collapsed";

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getStoredCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const getServerSnapshot = () => false;

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [localCollapsed, setLocalCollapsed] = useState<boolean | null>(null);
  const storedCollapsed = useSyncExternalStore(subscribeStorage, getStoredCollapsed, getServerSnapshot);
  const isCollapsed = localCollapsed ?? storedCollapsed;

  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Adjust state during render when pathname changes (official React pattern)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  const toggleCollapsed = useCallback(() => {
    setLocalCollapsed((prev) => {
      const current = prev ?? getStoredCollapsed();
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  }, []);

  // Keyboard shortcut Ctrl+B / Cmd+B for desktop toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapsed]);

  // Close mobile drawer on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
