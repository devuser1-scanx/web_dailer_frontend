// src/api/dashboard.ts

import { apiGet } from "./client";
import type { CallLog } from "../types/call";

export type DashboardSummary = {
  start_date: string;
  end_date: string;
  total_calls: number;
  outgoing_calls: number;
  incoming_calls: number;
  missed_calls: number;
  completed_calls: number;
  failed_or_busy_calls: number;
  no_answer_calls: number;
  average_duration_seconds: number;
  recent_calls: CallLog[];
  missed_calls_list: CallLog[];
};

export function getDashboardSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("start_date", startDate);
  }

  if (endDate) {
    params.set("end_date", endDate);
  }

  const query = params.toString();

  return apiGet<DashboardSummary>(
    `/dashboard/summary${query ? `?${query}` : ""}`
  );
}