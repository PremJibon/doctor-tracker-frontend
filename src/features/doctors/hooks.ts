import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { doctorApi } from "./api";
import { CreateDoctorDto, DoctorFilterParams } from "@/types/doctor";
import { CreatePatientDto } from "@/types/patient";
import { getErrorMessage } from "@/lib/axios";

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (params?: DoctorFilterParams) => [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  doctorPatients: (id: string, params?: { page?: number; limit?: number; search?: string }) =>
    [...doctorKeys.detail(id), "patients", params] as const,
};

export function useDoctors(params?: DoctorFilterParams) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () => doctorApi.getDoctors(params),
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorApi.getDoctorById(id),
    enabled: Boolean(id),
  });
}

export function useDoctorPatients(
  doctorId: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  return useQuery({
    queryKey: doctorKeys.doctorPatients(doctorId, params),
    queryFn: () => doctorApi.getDoctorPatients(doctorId, params),
    enabled: Boolean(doctorId),
    placeholderData: keepPreviousData,
  });
}

export function useCreateDoctorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorApi.createDoctor(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      toast.success("Doctor registered successfully", {
        description: `${data.doctor.name} has been added to the registry.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to register doctor", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useAddDoctorPatientMutation(defaultDoctorId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreatePatientDto | { doctorId: string; data: CreatePatientDto }) => {
      const targetDoctorId =
        "doctorId" in variables ? variables.doctorId : (defaultDoctorId || "");
      const payload = "data" in variables ? variables.data : variables;
      return doctorApi.addDoctorPatient(targetDoctorId, payload);
    },
    onSuccess: (data, variables) => {
      const targetDoctorId =
        "doctorId" in variables ? variables.doctorId : defaultDoctorId;
      if (targetDoctorId) {
        queryClient.invalidateQueries({ queryKey: doctorKeys.doctorPatients(targetDoctorId) });
      }
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient added successfully", {
        description: `${data.patient.name} has been assigned to doctor.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to add patient", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useRemoveDoctorPatientMutation(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => doctorApi.removeDoctorPatient(doctorId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.doctorPatients(doctorId) });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient removed", {
        description: "Patient has been unlinked from this doctor.",
      });
    },
    onError: (error) => {
      toast.error("Failed to remove patient", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useBulkDeleteDoctorsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, cascade }: { ids: string[]; cascade?: boolean }) =>
      doctorApi.bulkDeleteDoctors(ids, cascade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error("Bulk delete failed", {
        description: getErrorMessage(error),
      });
    },
  });
}
