"use client";

import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { getQueryClient } from "@/lib/query-client";
import { subscribeColdStart } from "@/lib/axios";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let toastId: string | number | undefined;
    const unsubscribe = subscribeColdStart((waking) => {
      setIsWaking(waking);
      if (waking) {
        toastId = toast.info("Waking up server...", {
          description: "Free-tier instances may take up to a minute to start. Please hang tight!",
          duration: 30000,
        });
      } else if (toastId) {
        toast.dismiss(toastId);
      }
    });

    return () => {
      unsubscribe();
      if (toastId) toast.dismiss(toastId);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isWaking && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground shadow-sm animate-pulse">
          ⚡ Waking up the cloud server (cold start in progress, may take ~45s)...
        </div>
      )}
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "0.5rem",
          },
        }}
      />
    </QueryClientProvider>
  );
}
