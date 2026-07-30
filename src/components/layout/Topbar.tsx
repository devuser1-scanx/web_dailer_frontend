// src/components/layout/Topbar.tsx

type TopbarProps = {
  title: string;
  subtitle?: string;
  websocketConnected?: boolean;
};

export function Topbar({
  title,
  subtitle,
  websocketConnected = false,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-status">
        <span
          className={`status-dot ${
            websocketConnected ? "online" : "offline"
          }`}
        />
        {websocketConnected ? "Live Connected" : "Live Disconnected"}
      </div>
    </header>
  );
}