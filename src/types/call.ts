// src/types/call.ts

export type CallLog = {
  id: number;
  appointment_id: string | null;
  staff_phone: string | null;
  patient_number: string | null;
  direction: string;
  call_sid: string | null;
  status: string | null;
  duration: number | null;
  created_at: string;
  updated_at: string | null;

  first_name?: string | null;
  last_name?: string | null;
  patient_name?: string | null;
  display_name?: string;
  is_known_patient?: boolean;
  is_missed?: boolean;

  email?: string | null;
  appointment_type?: string | null;
  clinic_id?: number | null;
  location?: string | null;
  calendar?: string | null;
  clinic_name?: string | null;
};

export type CallsResponse = {
  count: number;
  results: CallLog[];
};