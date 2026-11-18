import { apiClient } from "@/lib/axios";
import { ApiListResponse } from "@/types/api";
import { Patient, UpdatePatientDto, PatientFilterParams } from "@/types/patient";

export const patientApi = {
  getPatients: async (params?: PatientFilterParams): Promise<ApiListResponse<Patient>> => {
    const res = await apiClient.get<ApiListResponse<Patient>>("/patients", { params });
    return res.data;
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
