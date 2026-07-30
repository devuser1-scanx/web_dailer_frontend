// src/pages/PatientsPage.tsx

import { useState } from "react";
import { Search, Phone, Clock, PhoneOff } from "lucide-react";

import { searchPatients, getPatientCallHistory } from "../api/patients";
import type { PatientResult } from "../types/patient";
import type { CallLog } from "../types/call";

import {
  startOutgoingCall,
  hangupActiveCall,
  type TwilioCallStatus,
} from "../services/twilioVoice";

import { useTwilioVoiceState } from "../hooks/useTwilioVoiceState";

export function PatientsPage() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(
    null
  );
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setCallStatus] = useState<TwilioCallStatus>("idle");

  const globalCall = useTwilioVoiceState();

  const isCallActive =
    globalCall.status === "calling" ||
    globalCall.status === "ringing" ||
    globalCall.status === "connected";

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await searchPatients(query);
      setPatients(response.results);
    } catch (err) {
      console.error(err);
      setError("Unable to search patients. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (patient: PatientResult) => {
    if (!patient.phone) {
      alert("This patient does not have a phone number.");
      return;
    }

    try {
      setSelectedPatient(patient);
      setHistoryLoading(true);

      const response = await getPatientCallHistory(patient.phone);
      setCallHistory(response.history);
    } catch (err) {
      console.error(err);
      alert("Unable to load call history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCallPatient = async (patient: PatientResult) => {
    if (!patient.phone) {
      alert("This patient does not have a phone number.");
      return;
    }

    try {
      await startOutgoingCall(patient.phone, {
        onStatusChange: setCallStatus,
        onError: (message) => alert(message),
      });
    } catch (err) {
      console.error(err);
      alert("Unable to start call. Please check Twilio setup.");
    }
  };

  return (
    <div className="patient-layout">
      <div className="panel">
        <h3>Patient Search</h3>
        <p className="muted">Search by name, phone, or email.</p>

        <div className="search-row">
          <input
            className="input"
            placeholder="Search patient by name, phone, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <button className="primary-button search-button" onClick={handleSearch}>
            <Search size={18} />
            Search
          </button>
        </div>

        {loading && <div className="empty-state">Searching patients...</div>}

        {error && <div className="error-box">{error}</div>}

        {!loading && patients.length === 0 && (
          <div className="empty-state">Start typing to search patients.</div>
        )}

        <div className="result-list">
          {patients.map((patient) => (
            <div className="patient-card" key={patient.appointment_id}>
              <div>
                <h4>{patient.full_name || "Unnamed Patient"}</h4>

                <p>
                  {patient.phone || "No phone"} ·{" "}
                  {patient.email || "No email"}
                </p>

                <p className="muted">
                  {patient.appointment_type || "No exam"} ·{" "}
                  {patient.clinic_name || patient.location || "No clinic"}
                </p>
              </div>

              <div className="patient-actions">
                <button
                  className="secondary-button"
                  onClick={() => handleViewHistory(patient)}
                >
                  <Clock size={16} />
                  History
                </button>

                <button
                  className="primary-button mini"
                  onClick={() => handleCallPatient(patient)}
                >
                  <Phone size={16} />
                  Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Patient Call History</h3>

        <div className="active-call-box">
          <p className="muted">Current Call</p>

          {isCallActive ? (
            <>
              <h2>{globalCall.activeNumber}</h2>
              <p className="muted">Status: {globalCall.status}</p>

              <button
                className="danger-button call-button"
                style={{ marginTop: "14px" }}
                onClick={hangupActiveCall}
              >
                <PhoneOff size={18} />
                Hang Up
              </button>
            </>
          ) : (
            <>
              <h2>No active call</h2>
              <p className="muted">Start a call from a patient result.</p>
            </>
          )}
        </div>

        {!selectedPatient && (
          <p className="muted" style={{ marginTop: "18px" }}>
            Select a patient and click History.
          </p>
        )}

        {selectedPatient && (
          <>
            <div className="history-header">
              <h4>{selectedPatient.full_name || "Unnamed Patient"}</h4>
              <p className="muted">{selectedPatient.phone}</p>
            </div>

            {historyLoading && (
              <div className="empty-state">Loading history...</div>
            )}

            {!historyLoading && callHistory.length === 0 && (
              <div className="empty-state">No call history found.</div>
            )}

            <div className="call-list">
              {callHistory.map((call) => (
                <div className="call-row" key={call.id}>
                  <div>
                    <h4>
                      {call.display_name ||
                        call.patient_name ||
                        "Unknown Caller"}
                    </h4>
                    <p>{call.patient_number}</p>
                    <p className="muted">{call.created_at}</p>
                  </div>

                  <span className={`status-pill ${call.status || "unknown"}`}>
                    {call.status || "unknown"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}