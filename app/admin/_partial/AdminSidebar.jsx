"use client";

import { useState } from "react";
import Image from "next/image";
import { IconDashboard, IconUsers, IconSettings, IconSection, IconPlatform, IconEvent, IconPost, IconSocial, IconUserManagement, IconPermission, IconStatus, IconHero, IconCategorySmall, IconDiversity } from "../../../components/ui/icon";

export default function AdminSidebar({ collapsed, onClose, onToggleCollapse, onNavigate, currentView }) {
  const [openKeys, setOpenKeys] = useState({});

  const menus = [
    { key: "dashboard", label: "Dashboard", view: "dashboard", icon: IconDashboard, enabled: true },
    {
      key: "users",
      label: "Users",
      view: "users",
      icon: IconUsers,
      enabled: true,
      children: [
        { key: "user_management", label: "User Management", view: "users.user_management", icon: IconUserManagement, enabled: true },
        { key: "permission", label: "Permission", view: "users.permission", icon: IconPermission, enabled: true },
        { key: "status_management", label: "Status", view: "users.status_management", icon: IconStatus, enabled: true },
      ],
    },
    { key: "category", label: "Category", view: "category", icon: IconCategorySmall, enabled: true },
    {
      key: "section",
      label: "Section",
      view: "section",
      icon: IconSection,
      enabled: true,
      children: [
        { key: "hero", label: "Hero", view: "section.hero", icon: IconHero, enabled: true },
        // { key: 'category', label: 'Category', view: 'section.navigation', icon: IconCategorySmall, enabled: true },
      ],
    },
    { key: "platform", label: "Platform", view: "platform", icon: IconPlatform, enabled: true },
    { key: "event", label: "Event", view: "event", icon: IconEvent, enabled: false },
    { key: "post", label: "Post", view: "post", icon: IconPost, enabled: false },
    {
      key: "settings",
      label: "Settings",
      view: "settings",
      icon: IconSettings,
      enabled: true,
      children: [{ key: "team", label: "Team", view: "team", icon: IconDiversity, enabled: true }],
    },
  ];

  const toggleOpen = (key) => setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full overflow-y-auto bg-[#E83C91] flex flex-col">
      {/* Logo dan tombol tutup */}
      <div className={`px-4 py-4 flex items-center border-b border-zinc-100 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "w-full justify-center" : ""}`}>
          <button
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            className="flex items-center gap-3 focus:outline-none cursor-pointer"
            title={collapsed ? "Open sidebar" : "Collapse sidebar"}>
            <div className={`rounded-full p-1 ${collapsed ? "bg-[#E83C91]" : "bg-[#E83C91]"}`}>
              <Image
                src="/image/Logo-hysteria.svg"
                alt="Hysteria logo"
                width={40}
                height={40}
                className="h-8 w-8"
                priority
              />
            </div>
            {!collapsed && <span className="text-sm font-semibold text-white">Hysteria</span>}
          </button>
        </div>
        <div className={`flex items-center gap-2 ${collapsed ? "hidden" : ""}`}>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10">
            Close
          </button>
        </div>
      </div>

      {/* Parent Navigasi tabs */}
      <nav className="px-2 py-4 flex-1">
        <ul className="space-y-1">
          {menus.map((item) => {
            const Icon = item.icon;
            const enabled = !!item.enabled;
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isActive = currentView === item.view || (hasChildren && item.children.some((c) => c.view === currentView));
            const isOpen = !!openKeys[item.key];
            const baseClass = `group relative flex items-center gap-2 rounded-md text-sm font-medium ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2"}`;
            const enabledClass = isActive ? `bg-white/10 text-white` : `text-white hover:bg-white/10`;
            const disabledClass = `text-white/60 cursor-not-allowed`;

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
                    aria-current={isActive ? "page" : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    tabIndex={enabled ? 0 : -1}
                    className={`${baseClass} ${enabled ? enabledClass : disabledClass} w-full`}
                    aria-label={item.label}>
                    <Icon className="h-5 w-5 text-white" />
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        {hasChildren && (
                          <svg
                            className={`ml-auto h-4 w-4 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M6 4a1 1 0 011.707-.707l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 16.293L11.586 11 6 5.414A1 1 0 016 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {!enabled && <span className="ml-auto mr-1 inline-flex items-center rounded-full bg-white/20 px-1 py-0.5 text-[10px] font-medium text-white">Coming soon</span>}
                      </>
                    )}
                  </button>

                  {/* children nav tabs */}
                  {hasChildren && !collapsed && isOpen && (
                    <ul className="mt-0 space-y-0 pl-6 pr-1">
                      {item.children.map((child) => {
                        const childActive = currentView === child.view;
                        const childEnabled = !!child.enabled;
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.key}>
                            {(() => {
                              const childClassBase = "flex items-center gap-2 w-full text-sm rounded-md px-3 py-2";
                              const childEnabledClass = childActive ? "bg-white/10 text-white" : "text-white hover:bg-white/10";
                              const childDisabledClass = "text-white/60 cursor-not-allowed bg-transparent";
                              return (
                                <button
                                  onClick={() => childEnabled && onNavigate(child.view)}
                                  title={child.label}
                                  disabled={!childEnabled}
                                  aria-disabled={!childEnabled}
                                  aria-current={childActive ? "page" : undefined}
                                  tabIndex={childEnabled ? 0 : -1}
                                  className={`${childClassBase} ${childEnabled ? childEnabledClass : childDisabledClass}`}>
                                  {ChildIcon && <ChildIcon className="h-4 w-4 text-white" />}
                                  <span className="text-xs text-white">{child.label}</span>
                                  {!childEnabled && <span className="ml-auto mr-1 inline-flex items-center rounded-full bg-white/20 px-1 py-0.5 text-[10px] font-medium text-white">Coming soon</span>}
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
