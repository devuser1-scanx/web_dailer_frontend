// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  CheckCircle,
  AlertTriangle,
  Timer,
  RefreshCcw,
} from "lucide-react";

import { getDashboardSummary, type DashboardSummary } from "../api/dashboard";
import type { WebSocketEvent } from "../hooks/useWebSocket";
import type { CallLog } from "../types/call";

type DashboardPageProps = {
  events: WebSocketEvent[];
};

type FilterMode = "today" | "single" | "range";

export function DashboardPage({ events }: DashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const [filterMode, setFilterMode] = useState<FilterMode>("today");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getDateParams = () => {
    if (filterMode === "today") {
      return {
        start: undefined,
        end: undefined,
      };
    }

    if (filterMode === "single") {
      return {
        start: singleDate || undefined,
        end: singleDate || undefined,
      };
    }

    return {
      start: startDate || undefined,
      end: endDate || startDate || undefined,
    };
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const { start, end } = getDateParams();

      const response = await getDashboardSummary(start, end);

      setSummary(response);
    } catch (error) {
      console.error("Dashboard load failed:", error);
      alert("Unable to load dashboard summary. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [filterMode, singleDate, startDate, endDate]);

  useEffect(() => {
    const latestEvent = events[0];

    if (!latestEvent) return;

    const shouldRefresh =
      latestEvent.type === "outgoing_call_started" ||
      latestEvent.type === "incoming_call_started" ||
      latestEvent.type === "call_status_changed" ||
      latestEvent.type === "missed_call";

    if (shouldRefresh) {
      loadDashboard();
    }
  }, [events]);

  const rangeLabel =
    filterMode === "today"
      ? "Today"
      : filterMode === "single"
      ? singleDate || "Selected day"
      : startDate && endDate
      ? `${startDate} to ${endDate}`
      : startDate
      ? `${startDate} onwards`
      : "Date range";

  return (
    <div className="business-dashboard">
      <div className="dashboard-toolbar">
        <div>
          <h3>Call Summary</h3>
          <p className="muted">Showing: {rangeLabel}</p>
        </div>

        <div className="dashboard-toolbar-actions">
          <div className="dashboard-filter-box">
            <div className="filter-mode-row">
              <button
                className={`filter-mode-button ${
                  filterMode === "today" ? "active" : ""
                }`}
                onClick={() => setFilterMode("today")}
              >
                Today
              </button>

              <button
                className={`filter-mode-button ${
                  filterMode === "single" ? "active" : ""
                }`}
                onClick={() => setFilterMode("single")}
              >
                Single Day
              </button>

              <button
                className={`filter-mode-button ${
                  filterMode === "range" ? "active" : ""
                }`}
                onClick={() => setFilterMode("range")}
              >
                Date Range
              </button>
            </div>

            {filterMode === "single" && (
              <div className="date-range-row">
                <div className="date-field">
                  <span>Date</span>
                  <input
                    className="date-input"
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {filterMode === "range" && (
              <div className="date-range-row">
                <div className="date-field">
                  <span>From</span>
                  <input
                    className="date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="date-field">
                  <span>To</span>
                  <input
                    className="date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button className="icon-button" onClick={loadDashboard}>
            <RefreshCcw size={17} />
          </button>
        </div>
      </div>

      {loading && !summary && (
        <div className="panel">
          <p className="muted">Loading dashboard...</p>
        </div>
      )}

      {summary && (
        <>
          <div className="dashboard-card-grid">
            <DashboardCard
              title="Total Calls"
              value={summary.total_calls}
              subtitle="All calls in selected period"
              icon={<Phone size={24} />}
            />

            <DashboardCard
              title="Outgoing Calls"
              value={summary.outgoing_calls}
              subtitle="Calls made by staff"
              icon={<PhoneOutgoing size={24} />}
            />

            <DashboardCard
              title="Incoming Calls"
              value={summary.incoming_calls}
              subtitle="Calls received"
              icon={<PhoneIncoming size={24} />}
            />

            <DashboardCard
              title="Missed Calls"
              value={summary.missed_calls}
              subtitle="Needs follow-up"
              icon={<PhoneMissed size={24} />}
              danger={summary.missed_calls > 0}
            />

            <DashboardCard
              title="Completed Calls"
              value={summary.completed_calls}
              subtitle="Successfully completed"
              icon={<CheckCircle size={24} />}
            />

            <DashboardCard
              title="Failed / Busy"
              value={summary.failed_or_busy_calls}
              subtitle="Failed or busy calls"
              icon={<AlertTriangle size={24} />}
              warning={summary.failed_or_busy_calls > 0}
            />

            <DashboardCard
              title="No Answer"
              value={summary.no_answer_calls}
              subtitle="Patient did not answer"
              icon={<PhoneMissed size={24} />}
              warning={summary.no_answer_calls > 0}
            />

            <DashboardCard
              title="Avg Duration"
              value={formatDuration(summary.average_duration_seconds)}
              subtitle="Average call length"
              icon={<Timer size={24} />}
            />
          </div>

          <div className="dashboard-lists">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Missed Calls</h3>
                  <p className="muted">
                    Known patients show their name. Unknown callers show only
                    number.
                  </p>
                </div>
              </div>

              {summary.missed_calls_list.length === 0 && (
                <div className="empty-state">
                  No missed calls for selected period.
                </div>
              )}

              <div className="call-list">
                {summary.missed_calls_list.map((call) => (
                  <DashboardCallRow key={call.id} call={call} highlightMissed />
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Call Activity</h3>
                  <p className="muted">
                    Latest calls from the selected period.
                  </p>
                </div>
              </div>

              {summary.recent_calls.length === 0 && (
                <div className="empty-state">
                  No recent calls for selected period.
                </div>
              )}

              <div className="call-list">
                {summary.recent_calls.map((call) => (
                  <DashboardCallRow key={call.id} call={call} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  danger = false,
  warning = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`business-stat-card ${danger ? "danger" : ""} ${
        warning ? "warning" : ""
      }`}
    >
      <div className="business-stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function DashboardCallRow({
  call,
  highlightMissed = false,
}: {
  call: CallLog;
  highlightMissed?: boolean;
}) {
  const direction = (call.direction || "").toLowerCase();
  const isInbound = direction === "inbound";

  return (
    <div className={`dashboard-call-row ${highlightMissed ? "missed" : ""}`}>
      <div className="call-left">
        <div className={`call-icon ${highlightMissed ? "missed" : ""}`}>
          {isInbound ? <PhoneIncoming size={17} /> : <PhoneOutgoing size={17} />}
        </div>

        <div>
          <h4>{call.display_name || "Unknown Caller"}</h4>
          <p>{call.patient_number || "No phone"}</p>
          <p className="muted">
            {direction || "unknown"} · {formatDateTime(call.created_at)}
          </p>
        </div>
      </div>

      <div className="dashboard-call-actions">
        <span className={`status-pill ${call.status || "unknown"}`}>
          {call.status || "unknown"}
        </span>

        {highlightMissed && (
          <button
            className="primary-button mini"
            onClick={() =>
              alert(`Callback flow will be connected next: ${call.patient_number}`)
            }
          >
            Call Back
          </button>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "0s";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) return `${secs}s`;

  return `${mins}m ${secs}s`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}