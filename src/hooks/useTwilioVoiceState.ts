// src/hooks/useTwilioVoiceState.ts

import { useEffect, useState } from "react";
import {
  subscribeToTwilioVoiceState,
  type TwilioVoiceState,
} from "../services/twilioVoice";

export function useTwilioVoiceState() {
  const [state, setState] = useState<TwilioVoiceState>({
    status: "idle",
    activeNumber: "",
    error: "",
  });

  useEffect(() => {
    const unsubscribe = subscribeToTwilioVoiceState(setState);
    return unsubscribe;
  }, []);

  return state;
}