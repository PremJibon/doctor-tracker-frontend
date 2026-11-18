import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

type TimeRange = "7d" | "30d" | "12m";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  patientsPerDoctor: () => [...dashboardKeys.all, "patientsPerDoctor"] as const,
  patientsOverTime: (range: TimeRange) =>
    [...dashboardKeys.all, "patientsOverTime", range] as const,
  conditions: () => [...dashboardKeys.all, "conditions"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardApi.getSummary,
    staleTime: 60_000,
  });
}

export function usePatientsPerDoctor() {
  return useQuery({
    queryKey: dashboardKeys.patientsPerDoctor(),
    queryFn: dashboardApi.getPatientsPerDoctor,
    staleTime: 60_000,
  });
}

export function usePatientsOverTime(range: TimeRange) {
  return useQuery({
    queryKey: dashboardKeys.patientsOverTime(range),
    queryFn: () => dashboardApi.getPatientsOverTime(range),
    staleTime: 60_000,
  });
}

export function useConditions() {
  return useQuery({
    queryKey: dashboardKeys.conditions(),
    queryFn: dashboardApi.getConditions,
    staleTime: 60_000,
  });
}
