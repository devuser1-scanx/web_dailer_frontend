// src/components/layout/AppLayout.tsx

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppLayoutProps = {
  activePage: string;
  title: string;
  subtitle?: string;
  websocketConnected?: boolean;
  onNavigate: (page: string) => void;
  children: ReactNode;
};

export function AppLayout({
  activePage,
  title,
  subtitle,
  websocketConnected,
  onNavigate,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="main-area">
        <Topbar
          title={title}
          subtitle={subtitle}
          websocketConnected={websocketConnected}
        />

        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}