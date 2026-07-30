// src/App.tsx

import { useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { DialerPage } from "./pages/DialerPage";
import { PatientsPage } from "./pages/PatientsPage";
import { CallsPage } from "./pages/CallsPage";
import { useWebSocket } from "./hooks/useWebSocket";
import "./styles/app.css";

type PageKey = "dashboard" | "dialer" | "patients" | "calls";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Live overview of ScanX calling activity.",
  },
  dialer: {
    title: "Web Dialer",
    subtitle: "Dial patients or manual numbers from the browser.",
  },
  patients: {
    title: "Patients",
    subtitle: "Search existing patients and view call history.",
  },
  calls: {
    title: "Call History",
    subtitle: "Recent calls, missed calls, and follow-up status.",
  },
};

function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const { connected, events } = useWebSocket();

  const meta = pageMeta[activePage];

  let pageContent;

  if (activePage === "dashboard") {
    pageContent = <DashboardPage events={events} />;
  } else if (activePage === "dialer") {
    pageContent = <DialerPage />;
  } else if (activePage === "patients") {
    pageContent = <PatientsPage />;
  } else if (activePage === "calls") {
    pageContent = <CallsPage />;
  } else {
    pageContent = <DashboardPage events={events} />;
  }

  return (
    <AppLayout
      activePage={activePage}
      title={meta.title}
      subtitle={meta.subtitle}
      websocketConnected={connected}
      onNavigate={(page) => setActivePage(page as PageKey)}
    >
      {pageContent}
    </AppLayout>
  );
}

export default App;