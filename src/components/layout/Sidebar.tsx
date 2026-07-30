// src/components/layout/Sidebar.tsx

import {
  Phone,
  LayoutDashboard,
  Users,
  Clock,
} from "lucide-react";
import { BRANDING } from "../../config/branding";

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "dialer",
    label: "Dialer",
    icon: Phone,
  },
  {
    id: "patients",
    label: "Patients",
    icon: Users,
  },
  {
    id: "calls",
    label: "Call History",
    icon: Clock,
  },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {BRANDING.logoBase64 ? (
          <img src={BRANDING.logoBase64} alt="ScanX Logo" />
        ) : (
          <div className="logo-text">
            <span>Scan</span>
            <strong>X</strong>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>© {new Date().getFullYear()} ScanX Health All Rights Reserved.</span>
     </div>
    </aside>
  );
}