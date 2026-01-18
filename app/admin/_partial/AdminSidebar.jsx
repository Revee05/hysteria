"use client";

import Link from "next/link";
import { Logo, IconDashboard, IconUsers, IconSettings } from "../../../components/adminUI/icon";

export default function AdminSidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const menus = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: IconDashboard, enabled: true },
    { key: 'users', label: 'Users', href: '/admin/users', icon: IconUsers, enabled: false },
    { key: 'settings', label: 'Settings', href: '/admin/settings', icon: IconSettings, enabled: false },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-white">
      
      {/* Logo dan tombol tutup */}
      <div className={`px-4 py-4 flex items-center border-b border-zinc-100 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "w-full justify-center" : ""}`}>
          <button
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            className="flex items-center gap-3 focus:outline-none"
            title={collapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            <Logo size={40} />
            {!collapsed && <span className="text-sm font-semibold text-zinc-900">Hysteria</span>}
          </button>
        </div>
        <div className={`flex items-center gap-2 ${collapsed ? "hidden" : ""}`}>
          <button onClick={onClose} className="lg:hidden p-2 rounded-md text-zinc-600 hover:bg-zinc-50">Close</button>
        </div>
      </div>

      {/* Navigasi tabs */}
      <nav className="px-2 py-6">
        <ul className="space-y-1">
          {menus.map((item) => {
            const Icon = item.icon;
            const enabled = !!item.enabled;
            const baseClass = `group relative flex items-center gap-3 rounded-md text-sm font-medium ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2"}`;
            const enabledClass = `text-zinc-700 hover:bg-zinc-50`;
            const disabledClass = `text-zinc-400 cursor-not-allowed`;

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  title={item.label}
                  onClick={(e) => !enabled && e.preventDefault()}
                  aria-disabled={!enabled}
                  tabIndex={enabled ? 0 : -1}
                  className={`${baseClass} ${enabled ? enabledClass : disabledClass}`}
                  aria-label={item.label}
                >
                  <Icon />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      {!enabled && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Coming soon</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
