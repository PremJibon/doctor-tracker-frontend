"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useSpecialties } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Activity, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      specialization: string;
      doctors: number;
      patients: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-raised text-xs">
      <p className="font-semibold text-foreground mb-1">{item.specialization}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>
          Doctors: <span className="font-semibold text-foreground">{item.doctors}</span>
        </p>
        <p>
          Patients: <span className="font-semibold text-primary">{item.patients}</span>
        </p>
      </div>
    </div>
  );
}

export function SpecialtyBreakdownChart() {
  const { data, isLoading, isError, refetch, isRefetching } = useSpecialties();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 border-b border-border-subtle">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-60 mt-1" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-2 border-b border-border-subtle">
          <CardTitle className="text-sm font-semibold text-foreground">
            Specialty Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load specializations</p>
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
        <CardHeader className="pb-2 border-b border-border-subtle">
          <CardTitle className="text-sm font-semibold text-foreground">
            Specialty Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<Activity className="h-5 w-5" />}
            title="No specialty data"
            description="Specialty metrics will display once doctors are registered."
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = [...data]
    .sort((a, b) => b.doctors - a.doctors)
    .slice(0, 8);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-border-subtle">
        <CardTitle className="text-sm font-semibold text-foreground">
          Specialty Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Top 8 clinical specialties by registered practitioner count
        </p>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="specialization"
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                width={100}
                tickFormatter={(val: string) =>
                  val.length > 12 ? `${val.slice(0, 11)}…` : val
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="doctors"
                radius={[0, 4, 4, 0]}
                barSize={16}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
