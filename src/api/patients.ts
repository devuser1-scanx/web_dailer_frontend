// src/api/patients.ts

import { apiGet } from "./client";
import type { PatientSearchResponse } from "../types/patient";
import type { CallLog } from "../types/call";

export function searchPatients(query: string) {
  return apiGet<PatientSearchResponse>(
    `/patients/search?q=${encodeURIComponent(query)}`
  );
}

export function getPatientCallHistory(phone: string) {
  return apiGet<{ phone: string; history: CallLog[] }>(
    `/patients/call-history?phone=${encodeURIComponent(phone)}`
  );
}