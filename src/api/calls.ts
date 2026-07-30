// src/api/calls.ts

import { apiGet } from "./client";
import type { CallsResponse, CallLog } from "../types/call";

export function getRecentCalls(limit = 50) {
  return apiGet<CallsResponse>(`/calls/recent?limit=${limit}`);
}

export function getMissedCalls(limit = 50) {
  return apiGet<CallsResponse>(`/calls/missed?limit=${limit}`);
}

export function getCallDetail(callId: number) {
  return apiGet<CallLog>(`/calls/${callId}`);
}