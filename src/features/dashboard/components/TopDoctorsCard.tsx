"use client";

import React from "react";
import Link from "next/link";
import { usePatientsPerDoctor } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Stethoscope, RotateCw, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.\s*/i, "").trim();
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TopDoctorsCard() {
  const { data, isLoading, isError, refetch, isRefetching } = usePatientsPerDoctor();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
              <Skeleton className="h-5 w-14" />
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
            Top Doctors by Caseload
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load doctor caseloads</p>
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
            Top Doctors by Caseload
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<Stethoscope className="h-5 w-5" />}
            title="No doctor data"
            description="Assigned patient caseloads will appear once doctors have patients."
          />
        </CardContent>
      </Card>
    );
  }

  const topDoctors = data.slice(0, 5);
  const maxPatients = Math.max(...topDoctors.map((d) => d.count), 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Top Doctors by Caseload
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by assigned active patient count
            </p>
          </div>
          <Link
            href="/doctors"
            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-0.5 group transition-colors"
          >
            All doctors
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="divide-y divide-border-subtle/60">
          {topDoctors.map((doctor, index) => {
            const percentage = Math.round((doctor.count / maxPatients) * 100);
            const rank = index + 1;

            return (
              <div
                key={doctor.doctorId || index}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 group"
              >
                {/* Rank indicator badge */}
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    rank === 1
                      ? "bg-primary text-primary-foreground shadow-raised-sm"
                      : rank === 2
                      ? "bg-secondary text-secondary-foreground"
                      : rank === 3
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface-muted text-muted-foreground"
                  )}
                  aria-label={`Rank ${rank}`}
                >
                  {rank}
                </span>

                {/* Avatar */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary border border-border-subtle font-semibold text-xs shadow-inset"
                  aria-hidden="true"
                >
                  {getInitials(doctor.name)}
                </div>

                {/* Info & progress bar */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link
                      href={doctor.doctorId ? `/doctors/${doctor.doctorId}` : "/doctors"}
                      className="truncate text-xs font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {doctor.name}
                    </Link>
                    <span className="text-xs font-bold text-foreground shrink-0 tabular-nums">
                      {doctor.count} <span className="text-[11px] font-normal text-muted-foreground">pts</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-surface-muted shadow-inset overflow-hidden border border-border-subtle/50">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={doctor.count}
                      aria-valuemin={0}
                      aria-valuemax={maxPatients}
                    />
                  </div>

                  {/* Subtitle with specialization and hospital */}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                    {doctor.specialization && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-normal">
                        {doctor.specialization}
                      </Badge>
                    )}
                    {doctor.hospital && (
                      <span className="truncate flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{doctor.hospital}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
