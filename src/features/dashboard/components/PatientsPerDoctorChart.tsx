"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePatientsPerDoctor } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart2 } from "lucide-react";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function truncateName(name: string, maxLen = 14): string {
  const cleaned = name.replace(/^Dr\.\s*/i, "");
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen) + "…";
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

export function PatientsPerDoctorChart() {
  const { data, isLoading, isError } = usePatientsPerDoctor();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (isError || !data || data.length === 0) {
    return (
      <EmptyState
        icon={<BarChart2 className="h-5 w-5" />}
        title="No data available"
        description="Patient distribution data will appear here once doctors are assigned patients."
      />
    );
  }

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      name: truncateName(item.name),
      fullName: item.name,
      count: item.count,
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 8, left: -16, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
