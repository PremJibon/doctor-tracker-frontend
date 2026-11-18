import { apiClient } from "@/lib/axios";
import { ApiListResponse } from "@/types/api";
import { Patient, UpdatePatientDto, PatientFilterParams } from "@/types/patient";

export interface BulkDeletePatientsResult {
  requested: number;
  deleted: number;
  notFound: string[];
}

export const patientApi = {
  getPatients: async (params?: PatientFilterParams): Promise<ApiListResponse<Patient>> => {
    // Ensure inclusive end-of-day for 'to' parameter (Dhaka UTC+6 safe)
    let processedParams = params;
    if (params?.to && params.to.length === 10) {
      processedParams = {
        ...params,
        to: `${params.to}T23:59:59.999Z`,
      };
    }
    const res = await apiClient.get<ApiListResponse<Patient>>("/patients", { params: processedParams });
    return res.data;
  },

  bulkDeletePatients: async (ids: string[]): Promise<BulkDeletePatientsResult> => {
    const res = await apiClient.post<{ data: BulkDeletePatientsResult }>(
      "/patients/bulk-delete",
      { ids }
    );
    return res.data.data;
  },

  updatePatient: async (
    id: string,
    data: UpdatePatientDto
  ): Promise<{ patient: Patient; message?: string }> => {
    const res = await apiClient.patch<
      { data?: Patient; patient?: Patient; message?: string }
    >(`/patients/${id}`, data);
    const patient = res.data.patient || res.data.data;
    if (!patient) {
      throw new Error("Invalid response from server");
    }
    return { patient, message: res.data.message };
  },

  deletePatient: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success?: boolean; message?: string }>(
      `/patients/${id}`
    );
    return { success: res.data.success ?? true, message: res.data.message };
  },
};

export const getPatients = patientApi.getPatients;
export const updatePatient = patientApi.updatePatient;
export const deletePatient = patientApi.deletePatient;
export const bulkDeletePatients = patientApi.bulkDeletePatients;
