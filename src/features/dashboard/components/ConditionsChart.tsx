"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useConditions } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PieChart as PieChartIcon } from "lucide-react";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-muted-foreground">
        Count:{" "}
        <span className="font-semibold text-primary">{value}</span>
      </p>
      <p className="text-muted-foreground">
        Share:{" "}
        <span className="font-semibold">
          {(p.percent * 100).toFixed(1)}%
        </span>
      </p>
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
          <span className="truncate max-w-[100px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ConditionsChart() {
  const { data, isLoading, isError } = useConditions();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (isError || !data || data.length === 0) {
    return (
      <EmptyState
        icon={<PieChartIcon className="h-5 w-5" />}
        title="No condition data"
        description="Medical condition distribution will appear here once patients are added."
      />
    );
  }

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((item) => ({ name: item.condition, value: item.count }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
