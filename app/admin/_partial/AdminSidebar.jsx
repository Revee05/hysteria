"use client";

import { useState } from "react";
import { Logo, IconDashboard, IconUsers, IconSettings, IconPlatform, IconEvent, IconPost, IconSocial } from "../../../components/ui/icon";

export default function AdminSidebar({ open, collapsed, onClose, onToggleCollapse, onNavigate, currentView }) {
  const [openKeys, setOpenKeys] = useState({});

  const menus = [
    { key: 'dashboard', label: 'Dashboard', view: 'dashboard', icon: IconDashboard, enabled: true },
    { key: 'users', label: 'Users', view: 'users', icon: IconUsers, enabled: true, children: [
      { key: 'user_management', label: 'User Management', view: 'users.user_management', enabled: true },
      { key: 'permission', label: 'Permission', view: 'users.permission', enabled: true },
    ]},
    { key: 'platform', label: 'Platform', view: 'platform', icon: IconPlatform, enabled: false },
    { key: 'event', label: 'Event', view: 'event', icon: IconEvent, enabled: false },
    { key: 'post', label: 'Post', view: 'post', icon: IconPost, enabled: false },
    { key: 'social', label: 'Social', view: 'social', icon: IconSocial, enabled: false },
    { key: 'settings', label: 'Settings', view: 'settings', icon: IconSettings, enabled: false },
  ];

  const toggleOpen = (key) => setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col">
      {/* Logo dan tombol tutup */}
      <div className={`px-4 py-4 flex items-center border-b border-zinc-100 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "w-full justify-center" : ""}`}>
          <button
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            className="flex items-center gap-3 focus:outline-none"
            title={collapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            <Logo size={40} initials={collapsed ? 'HY' : 'HY'} bgColor={collapsed ? '#F3F4F6' : '#0EA5A4'} textColor={collapsed ? '#374151' : '#FFFFFF'} label="Hysteria" />
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
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isActive = currentView === item.view || (hasChildren && item.children.some(c => c.view === currentView));
            const isOpen = !!openKeys[item.key];
            const baseClass = `group relative flex items-center gap-3 rounded-md text-sm font-medium ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2"}`;
            const enabledClass = isActive 
              ? `bg-blue-50 text-blue-700` 
              : `text-zinc-700 hover:bg-zinc-50`;
            const disabledClass = `text-zinc-400 cursor-not-allowed`;

            const handleClick = () => {
              if (!enabled) return;
              if (hasChildren && !collapsed) {
                toggleOpen(item.key);
              } else {
                onNavigate(item.view);
              }
            };

            return (
              <li key={item.key}>
                <div className="w-full">
                  <button
                    onClick={handleClick}
                    title={item.label}
                    disabled={!enabled}
                    aria-disabled={!enabled}
                    aria-current={isActive ? 'page' : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    tabIndex={enabled ? 0 : -1}
                    className={`${baseClass} ${enabled ? enabledClass : disabledClass} w-full`}
                    aria-label={item.label}
                  >
                    <Icon />
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        {hasChildren && (
                          <svg className={`ml-auto h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M6 4a1 1 0 011.707-.707l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 16.293L11.586 11 6 5.414A1 1 0 016 4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {!enabled && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Coming soon</span>
                        )}
                      </>
                    )}
                  </button>

                  {hasChildren && !collapsed && isOpen && (
                    <ul className="mt-1 space-y-1 pl-9 pr-3">
                      {item.children.map((child) => {
                        const childActive = currentView === child.view;
                        const childEnabled = !!child.enabled;
                        return (
                          <li key={child.key}>
                            {(() => {
                              const childClassBase = 'flex items-center gap-2 w-full text-sm rounded-md px-3 py-2';
                              const childEnabledClass = childActive ? 'bg-blue-50 text-blue-700' : 'text-zinc-700 hover:bg-zinc-50';
                              const childDisabledClass = 'text-zinc-400 cursor-not-allowed bg-transparent';
                              return (
                                <button
                                  onClick={() => childEnabled && onNavigate(child.view)}
                                  title={child.label}
                                  disabled={!childEnabled}
                                  aria-disabled={!childEnabled}
                                  aria-current={childActive ? 'page' : undefined}
                                  tabIndex={childEnabled ? 0 : -1}
                                  className={`${childClassBase} ${childEnabled ? childEnabledClass : childDisabledClass}`}
                                >
                                  <span className="text-xs">{child.label}</span>
                                  {!childEnabled && (
                                    <span className="ml-auto inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Coming soon</span>
                                  )}
                                </button>
                              );
                            })()}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
