import { apiClient } from "@/lib/axios";
import {
  DashboardSummary,
  PatientsPerDoctorItem,
  PatientsOverTimeItem,
  ConditionItem,
} from "@/types/dashboard";

type TimeRange = "7d" | "30d" | "12m";

function unwrap<T>(
  data: T | { data: T } | { result: T } | Record<string, unknown>
): T {
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<
      DashboardSummary | { data: DashboardSummary }
    >("/dashboard/summary");
    return unwrap(res.data);
  },

  getPatientsPerDoctor: async (): Promise<PatientsPerDoctorItem[]> => {
    const res = await apiClient.get<
      PatientsPerDoctorItem[] | { data: PatientsPerDoctorItem[] }
    >("/dashboard/patients-per-doctor");
    return unwrap(res.data);
  },

  getPatientsOverTime: async (
    range: TimeRange = "30d"
  ): Promise<PatientsOverTimeItem[]> => {
    const res = await apiClient.get<
      PatientsOverTimeItem[] | { data: PatientsOverTimeItem[] }
    >("/dashboard/patients-over-time", { params: { range } });
    return unwrap(res.data);
  },

  getConditions: async (): Promise<ConditionItem[]> => {
    const res = await apiClient.get<
      ConditionItem[] | { data: ConditionItem[] }
    >("/dashboard/conditions");
    return unwrap(res.data);
  },
};
