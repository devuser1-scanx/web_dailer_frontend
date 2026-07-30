// src/api/voice.ts

import { apiGet } from "./client";

export type VoiceTokenResponse = {
  identity: string;
  token: string;
};

export function getVoiceToken(identity = "scanx_web_dialer") {
  return apiGet<VoiceTokenResponse>(
    `/voice/token?identity=${encodeURIComponent(identity)}`
  );
}