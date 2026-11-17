export interface Patient {
  _id: string;
  id?: string;
  name: string;
  nameLower?: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  doctorId: string | { _id: string; name: string; specialization?: string; hospital?: string };
  admittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  admittedAt?: string;
}

export interface UpdatePatientDto {
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  condition?: string;
  doctorId?: string;
  admittedAt?: string;
}

export interface PatientFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  sort?: string;
}
