// src/pages/CallsPage.tsx

import { useEffect, useState } from "react";
import { RefreshCcw, Phone, PhoneMissed } from "lucide-react";
import { getMissedCalls, getRecentCalls } from "../api/calls";
import type { CallLog } from "../types/call";

export function CallsPage() {
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([]);
  const [missedCalls, setMissedCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCalls = async () => {
    try {
      setLoading(true);

      const [recent, missed] = await Promise.all([
        getRecentCalls(50),
        getMissedCalls(50),
      ]);

      setRecentCalls(recent.results);
      setMissedCalls(missed.results);
    } catch (err) {
      console.error(err);
      alert("Unable to load calls. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  return (
    <div className="page-grid two">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Recent Calls</h3>
            <p className="muted">Latest inbound and outbound activity.</p>
          </div>

          <button className="icon-button" onClick={loadCalls}>
            <RefreshCcw size={17} />
          </button>
        </div>

        {loading && <div className="empty-state">Loading calls...</div>}

        {!loading && recentCalls.length === 0 && (
          <div className="empty-state">No recent calls found.</div>
        )}

        <div className="call-list">
          {recentCalls.map((call) => (
            <CallItem key={call.id} call={call} type="recent" />
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Missed Calls</h3>
            <p className="muted">
              Known patients are shown by name. Unknown callers show only number.
            </p>
          </div>

          <button className="icon-button" onClick={loadCalls}>
            <RefreshCcw size={17} />
          </button>
        </div>

        {!loading && missedCalls.length === 0 && (
          <div className="empty-state">No missed calls found.</div>
        )}

        <div className="call-list">
          {missedCalls.map((call) => (
            <CallItem key={call.id} call={call} type="missed" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CallItem({
  call,
  type,
}: {
  call: CallLog;
  type: "recent" | "missed";
}) {
  const Icon = type === "missed" ? PhoneMissed : Phone;

  return (
    <div className="call-row">
      <div className="call-left">
        <div className={`call-icon ${type}`}>
          <Icon size={17} />
        </div>

        <div>
          <h4>{call.display_name || "Unknown Caller"}</h4>
          <p>{call.patient_number || "No phone"}</p>
          <p className="muted">
            {call.direction} · {call.created_at}
          </p>
        </div>
      </div>

      <span className={`status-pill ${call.status || "unknown"}`}>
        {call.status || "unknown"}
      </span>
    </div>
  );
}