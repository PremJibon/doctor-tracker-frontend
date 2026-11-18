"use client";

import React from "react";
import { useHospitals } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function BusiestHospitalsCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useHospitals();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3 border-b border-border-subtle">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48 mt-1" />
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5 py-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border-subtle">
          <CardTitle className="text-sm font-semibold text-foreground">
            Busiest Hospitals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load hospital data</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="gap-2"
            >
              <RotateCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3 border-b border-border-subtle">
          <CardTitle className="text-sm font-semibold text-foreground">
            Busiest Hospitals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="No hospital data"
            description="Hospital caseload statistics will appear once doctors are assigned."
          />
        </CardContent>
      </Card>
    );
  }

  const topHospitals = data.slice(0, 5);
  const maxPatients = Math.max(...topHospitals.map((h) => h.patients), 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border-subtle">
        <CardTitle className="text-sm font-semibold text-foreground">
          Busiest Hospitals
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Top 5 healthcare centers by total active patients
        </p>
      </CardHeader>
      <CardContent className="pt-3 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="divide-y divide-border-subtle/50">
          {topHospitals.map((hospital, index) => {
            const percentage = Math.round((hospital.patients / maxPatients) * 100);
            const rank = index + 1;

            return (
              <div key={hospital.hospital || index} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-muted-foreground tabular-nums w-3.5">
                      {rank}.
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate" title={hospital.hospital}>
                      {hospital.hospital}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                      {hospital.doctors} doc{hospital.doctors !== 1 ? "s" : ""}
                    </Badge>
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {hospital.patients} <span className="text-[10px] font-normal text-muted-foreground">pts</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-surface-muted shadow-inset overflow-hidden border border-border-subtle/40">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={hospital.patients}
                    aria-valuemin={0}
                    aria-valuemax={maxPatients}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
