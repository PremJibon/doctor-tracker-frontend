"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Users, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/features/dashboard/hooks";

// Dynamic imports — charts can't SSR (Recharts uses browser APIs)
const PatientsPerDoctorChart = dynamic(
  () =>
    import("@/features/dashboard/components/PatientsPerDoctorChart").then(
      (m) => ({ default: m.PatientsPerDoctorChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

const PatientsOverTimeChart = dynamic(
  () =>
    import("@/features/dashboard/components/PatientsOverTimeChart").then(
      (m) => ({ default: m.PatientsOverTimeChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

const ConditionsChart = dynamic(
  () =>
    import("@/features/dashboard/components/ConditionsChart").then(
      (m) => ({ default: m.ConditionsChart })
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

function KpiCards() {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isError) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Doctors", icon: <Stethoscope className="h-5 w-5" /> },
          { title: "Total Patients", icon: <Users className="h-5 w-5" /> },
          { title: "Avg Patients / Doctor", icon: <Activity className="h-5 w-5" /> },
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Doctors"
        value={isLoading ? "—" : (data?.totalDoctors ?? 0).toLocaleString()}
        icon={<Stethoscope className="h-5 w-5" />}
        description="Registered healthcare providers"
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
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Clinical analytics overview — patient trends, caseloads, and condition distribution."
      />

      {/* KPI Cards */}
      <KpiCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Bar chart — wider */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Patients per Doctor{" "}
              <span className="font-normal text-muted-foreground">(Top 10)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PatientsPerDoctorChart />
          </CardContent>
        </Card>

        {/* Donut chart — narrower */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ConditionsChart />
          </CardContent>
        </Card>
      </div>

      {/* Area chart — full width */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Patient Admissions Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PatientsOverTimeChart />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
