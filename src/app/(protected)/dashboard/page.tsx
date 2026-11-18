"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Users,
  Activity,
  CalendarCheck,
  RotateCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashboardKeys,
  useDashboardSummary,
} from "@/features/dashboard/hooks";
import { TopDoctorsCard } from "@/features/dashboard/components/TopDoctorsCard";
import { BusiestHospitalsCard } from "@/features/dashboard/components/BusiestHospitalsCard";
import { RecentAdmissionsTable } from "@/features/dashboard/components/RecentAdmissionsTable";

// Dynamic imports — charts cannot SSR (Recharts requires browser SVG dimensions)
const PatientsOverTimeChart = dynamic(
  () =>
    import("@/features/dashboard/components/PatientsOverTimeChart").then(
      (m) => ({ default: m.PatientsOverTimeChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

const ConditionsChart = dynamic(
  () =>
    import("@/features/dashboard/components/ConditionsChart").then(
      (m) => ({ default: m.ConditionsChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

const SpecialtyBreakdownChart = dynamic(
  () =>
    import("@/features/dashboard/components/SpecialtyBreakdownChart").then(
      (m) => ({ default: m.SpecialtyBreakdownChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

const GenderChart = dynamic(
  () =>
    import("@/features/dashboard/components/GenderChart").then(
      (m) => ({ default: m.GenderChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

const AgeGroupsChart = dynamic(
  () =>
    import("@/features/dashboard/components/AgeGroupsChart").then(
      (m) => ({ default: m.AgeGroupsChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  }
);

function KpiCards() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useDashboardSummary();

  if (isError) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Doctors", icon: <Stethoscope className="h-5 w-5" /> },
            { title: "Total Patients", icon: <Users className="h-5 w-5" /> },
            {
              title: "Avg Patients / Doctor",
              icon: <Activity className="h-5 w-5" />,
            },
            {
              title: "30-Day Admissions",
              icon: <CalendarCheck className="h-5 w-5" />,
            },
          ].map(({ title, icon }) => (
            <StatCard
              key={title}
              title={title}
              value="—"
              icon={icon}
              description="Unable to load"
              isLoading={false}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-1.5 text-xs h-7"
          >
            <RotateCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
            Retry KPIs
          </Button>
        </div>
      </div>
    );
  }

  // Calculate admission trend vs previous 30 days
  const admissionsLast30d = data?.admissionsLast30d ?? 0;
  const admissionsPrev30d = data?.admissionsPrev30d ?? 0;
  let admissionTrend: { value: number; isPositive: boolean; label?: string } | undefined;

  if (data && typeof data.admissionsLast30d === "number") {
    if (admissionsPrev30d === 0) {
      admissionTrend = {
        value: admissionsLast30d > 0 ? 100 : 0,
        isPositive: admissionsLast30d >= 0,
        label: "vs prev 30d",
      };
    } else {
      const diff = admissionsLast30d - admissionsPrev30d;
      const pct = Math.round((diff / admissionsPrev30d) * 100);
      admissionTrend = {
        value: pct,
        isPositive: diff >= 0,
        label: "vs prev 30d",
      };
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Doctors"
        value={isLoading ? "—" : (data?.totalDoctors ?? 0).toLocaleString()}
        icon={<Stethoscope className="h-5 w-5" />}
        description={
          data?.newDoctorsLast30d
            ? `+${data.newDoctorsLast30d} new this month`
            : "Registered healthcare providers"
        }
        isLoading={isLoading}
      />
      <StatCard
        title="Total Patients"
        value={isLoading ? "—" : (data?.totalPatients ?? 0).toLocaleString()}
        icon={<Users className="h-5 w-5" />}
        description="Active patient records"
        isLoading={isLoading}
      />
      <StatCard
        title="Avg Patients / Doctor"
        value={
          isLoading
            ? "—"
            : typeof data?.avgPatientsPerDoctor === "number"
            ? data.avgPatientsPerDoctor.toFixed(1)
            : "—"
        }
        icon={<Activity className="h-5 w-5" />}
        description="Mean caseload per practitioner"
        isLoading={isLoading}
      />
      <StatCard
        title="30-Day Admissions"
        value={isLoading ? "—" : admissionsLast30d.toLocaleString()}
        icon={<CalendarCheck className="h-5 w-5" />}
        trend={admissionTrend}
        description="Admitted in the past 30 days"
        isLoading={isLoading}
      />
    </div>
  );
}

function DashboardContent() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    setLastRefreshed(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Clinical Analytics Dashboard"
          description="Real-time clinical metrics, patient intake velocity, department workloads, and demographic trends."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 gap-1.5 text-xs shadow-raised-sm"
            aria-label="Refresh dashboard data"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <KpiCards />

      {/* Row 2: Admissions Over Time Area + Medical Conditions Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2 border-b border-border-subtle">
            <CardTitle className="text-sm font-semibold text-foreground">
              Patient Admissions Over Time
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical admission trajectory across customizable time intervals
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <PatientsOverTimeChart />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2 border-b border-border-subtle">
            <CardTitle className="text-sm font-semibold text-foreground">
              Medical Conditions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Diagnostic classification across all active patients
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <ConditionsChart />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Doctors Ranked List + Specialty Breakdown Horizontal Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDoctorsCard />
        <SpecialtyBreakdownChart />
      </div>

      {/* Row 4: Gender Split + Age Groups Column + Busiest Hospitals Top 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GenderChart />
        <AgeGroupsChart />
        <BusiestHospitalsCard />
      </div>

      {/* Row 5: Recent Admissions Table */}
      <RecentAdmissionsTable />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <Skeleton className="h-72 rounded-xl xl:col-span-3" />
            <Skeleton className="h-72 rounded-xl xl:col-span-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
