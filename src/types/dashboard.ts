export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  admissionsLast30d?: number;
  admissionsPrev30d?: number;
  newDoctorsLast30d?: number;
}

export interface PatientsPerDoctorItem {
  doctorId: string;
  name: string;
  count: number;
  specialization?: string;
  hospital?: string;
}

export interface PatientsOverTimeItem {
  date: string;
  count: number;
}

export interface ConditionItem {
  condition: string;
  count: number;
}

export interface GenderItem {
  gender: string;
  count: number;
}

export interface AgeGroupItem {
  ageGroup: string;
  count: number;
}

export interface SpecialtyItem {
  specialization: string;
  doctors: number;
  patients: number;
}

export interface HospitalItem {
  hospital: string;
  doctors: number;
  patients: number;
}

export interface RecentAdmissionItem {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  admittedAt: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
}
