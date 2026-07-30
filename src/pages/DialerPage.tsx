// src/pages/DialerPage.tsx

import { useState } from "react";
import { Delete, Phone, X, PhoneOff } from "lucide-react";

import {
  startOutgoingCall,
  hangupActiveCall,
  sendDigitsToActiveCall,
  type TwilioCallStatus,
} from "../services/twilioVoice";

import { useTwilioVoiceState } from "../hooks/useTwilioVoiceState";

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

function isActiveCallStatus(status: TwilioCallStatus) {
  return status === "calling" || status === "ringing" || status === "connected";
}

export function DialerPage() {
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [callStatus, setCallStatus] = useState<TwilioCallStatus>("idle");
  const [error, setError] = useState("");
  const [lastDtmfDigit, setLastDtmfDigit] = useState("");

  const globalCall = useTwilioVoiceState();

  const effectiveStatus = globalCall.status || callStatus;
  const isCallActive = isActiveCallStatus(effectiveStatus);
  const isCallConnected = effectiveStatus === "connected";

  const handleKeyPress = (key: string) => {
    setError("");

    if (isCallConnected) {
      try {
        const sentDigit = sendDigitsToActiveCall(key);
        setLastDtmfDigit(sentDigit);
      } catch (err) {
        console.error("Failed to send DTMF digit:", err);
        setError("Unable to send keypad tone. The call may not be connected yet.");
      }

      return;
    }

    setPhoneNumber((prev) => `${prev}${key}`);
  };

  const handleInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d+*#]/g, "");
    setPhoneNumber(cleaned);
  };

  const handleBackspace = () => {
    if (isCallConnected) {
      setError("Backspace is disabled during a connected call. Use keypad digits for IVR.");
      return;
    }

    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isCallConnected) {
      setLastDtmfDigit("");
      setError("");
      return;
    }

    setPhoneNumber("");
    setLastDtmfDigit("");
    setError("");
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    try {
      setError("");
      setLastDtmfDigit("");

      await startOutgoingCall(phoneNumber, {
        onStatusChange: setCallStatus,
        onError: setError,
      });
    } catch (err) {
      console.error(err);
      setCallStatus("error");
      setError("Unable to start call. Please check Twilio setup.");
    }
  };

  const handleHangup = () => {
    hangupActiveCall();
    setCallStatus("disconnected");
    setLastDtmfDigit("");
  };

  return (
    <div className="dialer-layout">
      <div className="panel dialer-panel">
        <h3>Web Dialer</h3>

        <p className="muted">
          {isCallConnected
            ? "Call connected. Keypad now sends IVR tones."
            : "Enter a number manually or use the virtual keypad."}
        </p>

        <input
          className="phone-display-input"
          value={phoneNumber}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter phone number"
          disabled={isCallConnected}
        />

        <div className="keypad">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              className={`keypad-button ${isCallConnected ? "dtmf-mode" : ""}`}
              onClick={() => handleKeyPress(key)}
              title={
                isCallConnected
                  ? `Send IVR tone ${key}`
                  : `Add ${key} to phone number`
              }
            >
              {key}
            </button>
          ))}
        </div>

        {isCallConnected && (
          <div className="info-box">
            <strong>DTMF mode active.</strong>
            <span>
              Press 1, 2, 3, *, or # here to control the other party&apos;s IVR.
            </span>

            {(lastDtmfDigit || globalCall.lastDtmfDigit) && (
              <span>
                Last tone sent:{" "}
                <strong>{lastDtmfDigit || globalCall.lastDtmfDigit}</strong>
              </span>
            )}
          </div>
        )}

        {!isCallConnected ? (
          <div className="dialer-actions">
            <button className="secondary-button" onClick={handleBackspace}>
              <Delete size={18} />
              Backspace
            </button>

            <button className="secondary-button danger" onClick={handleClear}>
              <X size={18} />
              Clear
            </button>
          </div>
        ) : (
          <div className="dialer-actions">
            <button className="secondary-button" onClick={handleClear}>
              <X size={18} />
              Clear Last Tone
            </button>
          </div>
        )}

        {!isCallActive ? (
          <button className="primary-button call-button" onClick={handleCall}>
            <Phone size={19} />
            Call
          </button>
        ) : (
          <button className="danger-button call-button" onClick={handleHangup}>
            <PhoneOff size={19} />
            Hang Up
          </button>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>

      <div className="panel">
        <h3>Active Call</h3>

        <div className="active-call-box">
          <p className="muted">Selected Number</p>
          <h2>{globalCall.activeNumber || phoneNumber || "No number entered"}</h2>
        </div>

        <div className="active-call-box">
          <p className="muted">Call Status</p>
          <h2 className={`call-status-text ${effectiveStatus}`}>
            {effectiveStatus.toUpperCase()}
          </h2>
        </div>

        <div className="active-call-box">
          <p className="muted">Keypad Mode</p>
          <h2>{isCallConnected ? "DTMF / IVR" : "Number Entry"}</h2>
        </div>

        <p className="muted" style={{ marginTop: "18px" }}>
          DTMF tones work only after the call is connected. Before connection,
          the keypad edits the phone number.
        </p>
      </div>
    </div>
  );
}