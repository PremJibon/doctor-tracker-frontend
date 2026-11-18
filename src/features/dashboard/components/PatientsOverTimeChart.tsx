"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePatientsOverTime } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TrendingUp, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimeRange = "7d" | "30d" | "12m";

const RANGES: { label: string; value: TimeRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "12 Months", value: "12m" },
];

function formatDate(dateStr: string, range: TimeRange): string {
  try {
    const d = new Date(dateStr);
    if (range === "12m") {
      return d.toLocaleDateString("en-US", { month: "short" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Patients:{" "}
        <span className="font-semibold text-primary">{payload[0].value}</span>
      </p>
    </div>
  );
}

export function PatientsOverTimeChart() {
  const [range, setRange] = useState<TimeRange>("30d");
  const { data, isLoading, isError, refetch, isRefetching } = usePatientsOverTime(range);

  const chartData = (data || []).map((item) => ({
    date: formatDate(item.date, range),
    count: item.count,
  }));

  return (
    <div className="space-y-3">
      {/* Range toggle */}
      <div className="flex items-center gap-1">
        {RANGES.map((r) => (
          <Button
            key={r.value}
            variant={range === r.value ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-lg" />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <p className="text-sm text-danger font-medium">Failed to load admission trends</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-5 w-5" />}
          title="No trend data"
          description="Patient admission trends will appear here once data is available."
        />
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#colorCount)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-1)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
