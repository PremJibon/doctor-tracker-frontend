"use client";

import React from "react";
import Link from "next/link";
import { useRecentAdmissions } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserCheck, RotateCw, ArrowRight, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

function formatAdmittedDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function RecentAdmissionsTable() {
  const { data, isLoading, isError, refetch, isRefetching } = useRecentAdmissions(8);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Recent Patient Admissions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest patient intake across all departments
            </p>
          </div>
          <Link
            href="/patients"
            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 group transition-colors self-start sm:self-auto"
          >
            View all patients
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border-subtle last:border-0">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-4 w-28 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load recent admissions</p>
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
        ) : !data || data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<UserCheck className="h-5 w-5" />}
              title="No recent admissions"
              description="New patients admitted to any department will appear in this registry."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted/60 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border-subtle">
                <tr>
                  <th scope="col" className="px-4 py-3">Patient</th>
                  <th scope="col" className="px-4 py-3">Age / Gender</th>
                  <th scope="col" className="px-4 py-3">Condition</th>
                  <th scope="col" className="px-4 py-3">Attending Doctor</th>
                  <th scope="col" className="px-4 py-3 text-right">Admitted At (Dhaka)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-foreground">
                {data.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-surface-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <Link
                        href={`/patients?search=${encodeURIComponent(patient.name)}`}
                        className="hover:text-primary transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {patient.age} yrs • <span className="capitalize">{patient.gender}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal text-[11px] px-2 py-0.5">
                        {patient.condition}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {patient.doctorName ? (
                        <div className="flex flex-col">
                          <Link
                            href={patient.doctorId ? `/doctors/${patient.doctorId}` : "/doctors"}
                            className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <Stethoscope className="h-3 w-3 text-primary shrink-0" />
                            <span>{patient.doctorName}</span>
                          </Link>
                          {patient.doctorSpecialization && (
                            <span className="text-[10px] text-muted-foreground ml-4">
                              {patient.doctorSpecialization}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                      {formatAdmittedDate(patient.admittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
