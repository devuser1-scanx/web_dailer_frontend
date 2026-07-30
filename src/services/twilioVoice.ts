// src/services/twilioVoice.ts

import { Device, type Call } from "@twilio/voice-sdk";
import { getVoiceToken } from "../api/voice";

let device: Device | null = null;
let activeCall: Call | null = null;

export type TwilioCallStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "calling"
  | "ringing"
  | "connected"
  | "disconnected"
  | "error";

export type TwilioVoiceState = {
  status: TwilioCallStatus;
  activeNumber: string;
  error: string;
  lastDtmfDigit?: string;
};

let currentState: TwilioVoiceState = {
  status: "idle",
  activeNumber: "",
  error: "",
  lastDtmfDigit: "",
};

const listeners = new Set<(state: TwilioVoiceState) => void>();

function emitState(update: Partial<TwilioVoiceState>) {
  currentState = {
    ...currentState,
    ...update,
  };

  listeners.forEach((listener) => listener({ ...currentState }));
}

function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function isCallConnectedForDtmf() {
  if (!activeCall) return false;

  try {
    return activeCall.status() === "open";
  } catch {
    return currentState.status === "connected";
  }
}

export function subscribeToTwilioVoiceState(
  listener: (state: TwilioVoiceState) => void
) {
  listeners.add(listener);
  listener({ ...currentState });

  return () => {
    listeners.delete(listener);
  };
}

export type TwilioVoiceCallbacks = {
  onStatusChange?: (status: TwilioCallStatus) => void;
  onError?: (message: string) => void;
};

export async function initializeTwilioDevice(
  callbacks?: TwilioVoiceCallbacks
): Promise<Device> {
  if (device) {
    callbacks?.onStatusChange?.("ready");
    emitState({ status: "ready", error: "" });
    return device;
  }

  callbacks?.onStatusChange?.("initializing");
  emitState({ status: "initializing", error: "" });

  try {
    const response = await getVoiceToken("scanx_web_dialer");

    device = new Device(response.token, {
      logLevel: 1,
    });

    device.on("registered", () => {
      callbacks?.onStatusChange?.("ready");
      emitState({ status: "ready", error: "" });
    });

    device.on("error", (error) => {
      console.error("Twilio Device Error:", error);

      const message = getSafeErrorMessage(error, "Twilio device error");

      callbacks?.onStatusChange?.("error");
      callbacks?.onError?.(message);

      emitState({
        status: "error",
        error: message,
      });
    });

    device.on("incoming", (call) => {
      console.log("Incoming call ignored in Phase 1:", call);
    });

    await device.register();

    return device;
  } catch (error) {
    console.error("Unable to initialize Twilio Device:", error);

    const message = getSafeErrorMessage(
      error,
      "Unable to initialize browser calling."
    );

    callbacks?.onStatusChange?.("error");
    callbacks?.onError?.(message);

    emitState({
      status: "error",
      error: message,
    });

    throw error;
  }
}

export async function startOutgoingCall(
  to: string,
  callbacks?: TwilioVoiceCallbacks
): Promise<Call> {
  const cleanedTo = to.trim();

  if (!cleanedTo) {
    const message = "Please enter a phone number.";

    callbacks?.onStatusChange?.("error");
    callbacks?.onError?.(message);

    emitState({
      status: "error",
      error: message,
    });

    throw new Error(message);
  }

  if (!device) {
    await initializeTwilioDevice(callbacks);
  }

  if (!device) {
    throw new Error("Twilio device could not be initialized.");
  }

  callbacks?.onStatusChange?.("calling");

  emitState({
    status: "calling",
    activeNumber: cleanedTo,
    error: "",
    lastDtmfDigit: "",
  });

  try {
    activeCall = await device.connect({
      params: {
        to: cleanedTo,
      },
    });

    activeCall.on("ringing", () => {
      callbacks?.onStatusChange?.("ringing");
      emitState({ status: "ringing" });
    });

    activeCall.on("accept", () => {
      callbacks?.onStatusChange?.("connected");
      emitState({ status: "connected", error: "" });
    });

    activeCall.on("disconnect", () => {
      callbacks?.onStatusChange?.("disconnected");

      activeCall = null;

      emitState({
        status: "disconnected",
        activeNumber: "",
        lastDtmfDigit: "",
      });
    });

    activeCall.on("cancel", () => {
      callbacks?.onStatusChange?.("disconnected");

      activeCall = null;

      emitState({
        status: "disconnected",
        activeNumber: "",
        lastDtmfDigit: "",
      });
    });

    activeCall.on("error", (error) => {
      console.error("Twilio Call Error:", error);

      const message = getSafeErrorMessage(error, "Call failed");

      callbacks?.onStatusChange?.("error");
      callbacks?.onError?.(message);

      emitState({
        status: "error",
        error: message,
      });
    });

    return activeCall;
  } catch (error) {
    console.error("Unable to start outgoing call:", error);

    const message = getSafeErrorMessage(
      error,
      "Unable to start call. Please check Twilio setup."
    );

    callbacks?.onStatusChange?.("error");
    callbacks?.onError?.(message);

    emitState({
      status: "error",
      error: message,
    });

    throw error;
  }
}

export function sendDigitsToActiveCall(digits: string) {
  const cleanedDigits = digits.replace(/[^0-9*#w]/g, "");

  if (!cleanedDigits) {
    throw new Error("Invalid DTMF digit.");
  }

  if (!activeCall || !isCallConnectedForDtmf()) {
    throw new Error("No connected call available for DTMF.");
  }

  activeCall.sendDigits(cleanedDigits);

  emitState({
    lastDtmfDigit: cleanedDigits,
    error: "",
  });

  return cleanedDigits;
}

export function hangupActiveCall() {
  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }

  if (device) {
    device.disconnectAll();
  }

  emitState({
    status: "disconnected",
    activeNumber: "",
    lastDtmfDigit: "",
  });
}

export function getTwilioDevice() {
  return device;
}

export function getActiveCall() {
  return activeCall;
}