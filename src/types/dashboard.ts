export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
}

export interface PatientsPerDoctorItem {
  doctorId: string;
  name: string;
  count: number;
}

export interface PatientsOverTimeItem {
  date: string;
  count: number;
}

export interface ConditionItem {
  condition: string;
  count: number;
}
