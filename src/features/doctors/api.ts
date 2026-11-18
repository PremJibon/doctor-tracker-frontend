import { apiClient } from "@/lib/axios";
import { ApiListResponse } from "@/types/api";
import { Doctor, CreateDoctorDto, DoctorFilterParams } from "@/types/doctor";
import { Patient, CreatePatientDto } from "@/types/patient";

export const doctorApi = {
  getDoctors: async (params?: DoctorFilterParams): Promise<ApiListResponse<Doctor>> => {
    const res = await apiClient.get<ApiListResponse<Doctor>>("/doctors", {
      params,
    });
    return res.data;
  },

  createDoctor: async (
    data: CreateDoctorDto
  ): Promise<{ doctor: Doctor; message?: string }> => {
    const res = await apiClient.post<{ data?: Doctor; doctor?: Doctor; message?: string }>(
      "/doctors",
      data
    );
    const doctor = res.data.doctor || res.data.data;
    if (!doctor) {
      throw new Error("Invalid response received from server");
    }
    return { doctor, message: res.data.message };
  },

  getDoctorById: async (id: string): Promise<{ doctor: Doctor }> => {
    const res = await apiClient.get<{ data?: Doctor; doctor?: Doctor }>(
      `/doctors/${id}`
    );
    const doctor = res.data.doctor || res.data.data;
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    return { doctor };
  },

  getDoctorPatients: async (
    doctorId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<ApiListResponse<Patient>> => {
    const res = await apiClient.get<ApiListResponse<Patient>>(
      `/doctors/${doctorId}/patients`,
      { params }
    );
    return res.data;
  },

  addDoctorPatient: async (
    doctorId: string,
    data: CreatePatientDto
  ): Promise<{ patient: Patient; message?: string }> => {
    const res = await apiClient.post<{ data?: Patient; patient?: Patient; message?: string }>(
      `/doctors/${doctorId}/patients`,
      data
    );
    const patient = res.data.patient || res.data.data;
    if (!patient) {
      throw new Error("Invalid response received from server");
    }
    return { patient, message: res.data.message };
  },

  removeDoctorPatient: async (
    doctorId: string,
    patientId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success?: boolean; message?: string }>(
      `/doctors/${doctorId}/patients/${patientId}`
    );
    return { success: res.data.success ?? true, message: res.data.message };
  },
};

export const getDoctors = doctorApi.getDoctors;
export const createDoctor = doctorApi.createDoctor;
export const getDoctorById = doctorApi.getDoctorById;
export const getDoctorPatients = doctorApi.getDoctorPatients;
export const addDoctorPatient = doctorApi.addDoctorPatient;
export const removeDoctorPatient = doctorApi.removeDoctorPatient;
