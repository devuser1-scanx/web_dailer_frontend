// src/types/patient.ts

export type PatientResult = {
  appointment_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  appointment_type: string | null;
  category: string | null;
  appointment_datetime: string | null;
  date: string | null;
  time: string | null;
  clinic_id: number | null;
  location: string | null;
  calendar: string | null;
  clinic_name: string | null;
  clinic_city: string | null;
};

export type PatientSearchResponse = {
  query: string;
  count: number;
  results: PatientResult[];
};