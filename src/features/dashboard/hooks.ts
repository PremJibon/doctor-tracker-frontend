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
  gender: () => [...dashboardKeys.all, "gender"] as const,
  ageGroups: () => [...dashboardKeys.all, "ageGroups"] as const,
  specialties: () => [...dashboardKeys.all, "specialties"] as const,
  hospitals: () => [...dashboardKeys.all, "hospitals"] as const,
  recentAdmissions: (limit: number = 8) =>
    [...dashboardKeys.all, "recentAdmissions", limit] as const,
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

export function useGender() {
  return useQuery({
    queryKey: dashboardKeys.gender(),
    queryFn: dashboardApi.getGender,
    staleTime: 60_000,
  });
}

export function useAgeGroups() {
  return useQuery({
    queryKey: dashboardKeys.ageGroups(),
    queryFn: dashboardApi.getAgeGroups,
    staleTime: 60_000,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: dashboardKeys.specialties(),
    queryFn: dashboardApi.getSpecialties,
    staleTime: 60_000,
  });
}

export function useHospitals() {
  return useQuery({
    queryKey: dashboardKeys.hospitals(),
    queryFn: dashboardApi.getHospitals,
    staleTime: 60_000,
  });
}

export function useRecentAdmissions(limit: number = 8) {
  return useQuery({
    queryKey: dashboardKeys.recentAdmissions(limit),
    queryFn: () => dashboardApi.getRecentAdmissions(limit),
    staleTime: 60_000,
  });
}
