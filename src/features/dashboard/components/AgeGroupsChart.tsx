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
import { useAgeGroups } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      ageGroup: string;
      count: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-raised text-xs">
      <p className="font-semibold text-foreground">Age Bracket: {item.ageGroup} yrs</p>
      <p className="text-muted-foreground mt-1">
        Patients: <span className="font-semibold text-primary">{item.count}</span>
      </p>
    </div>
  );
}

export function AgeGroupsChart() {
  const { data, isLoading, isError, refetch, isRefetching } = useAgeGroups();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 border-b border-border-subtle">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-56 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-2 border-b border-border-subtle">
          <CardTitle className="text-sm font-semibold text-foreground">
            Age Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load age data</p>
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
            Age Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<Calendar className="h-5 w-5" />}
            title="No age data"
            description="Age distribution will appear once patient ages are registered."
          />
        </CardContent>
      </Card>
    );
  }

  // Pre-sort by standard age ranges
  const order = ["0-17", "18-34", "35-49", "50-64", "65+"];
  const chartData = [...data].sort(
    (a, b) => order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup)
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-border-subtle">
        <CardTitle className="text-sm font-semibold text-foreground">
          Age Groups
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Patient classification across standard age brackets
        </p>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -20, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="ageGroup"
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                barSize={24}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
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
