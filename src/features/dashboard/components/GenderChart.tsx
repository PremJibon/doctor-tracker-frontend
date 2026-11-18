"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGender } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

const GENDER_COLORS: Record<string, string> = {
  male: "var(--chart-1)",
  female: "var(--chart-2)",
  other: "var(--chart-3)",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-raised text-xs">
      <p className="font-semibold text-foreground capitalize">{name}</p>
      <div className="space-y-0.5 text-muted-foreground mt-1">
        <p>
          Count: <span className="font-semibold text-foreground">{value}</span>
        </p>
        <p>
          Share: <span className="font-semibold text-primary">{(p.percent * 100).toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GenderChart() {
  const { data, isLoading, isError, refetch, isRefetching } = useGender();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 border-b border-border-subtle">
          <Skeleton className="h-5 w-32" />
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
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-danger font-medium">Failed to load gender data</p>
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
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<Users2 className="h-5 w-5" />}
            title="No gender records"
            description="Demographic data will show once patients are admitted."
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.gender,
    value: item.count,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-border-subtle">
        <CardTitle className="text-sm font-semibold text-foreground">
          Gender Breakdown
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Demographic proportion of registered patients
        </p>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={46}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  const key = entry.name.toLowerCase();
                  const fill =
                    GENDER_COLORS[key] || `var(--chart-${(index % 5) + 1})`;
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
