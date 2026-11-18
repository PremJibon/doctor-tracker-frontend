import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { patientApi } from "./api";
import { PatientFilterParams, UpdatePatientDto } from "@/types/patient";
import { getErrorMessage } from "@/lib/axios";

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params?: PatientFilterParams) => [...patientKeys.lists(), params] as const,
};

export function usePatients(params?: PatientFilterParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientApi.getPatients(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) =>
      patientApi.updatePatient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient updated", {
        description: `${data.patient.name}'s details have been saved.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update patient", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientApi.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient deleted", {
        description: "The patient record has been permanently removed.",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete patient", {
        description: getErrorMessage(error),
      });
    },
  });
}
