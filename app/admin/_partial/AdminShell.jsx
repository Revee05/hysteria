"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "./AdminTopbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import { AuthProvider } from "../../../lib/context/auth-context.jsx";
import Users from "../users/user.page.jsx";

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setOpen(false); // Close mobile sidebar after navigation
  };

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <Users />;
      case 'dashboard':
      default:
        return children;
    }
  };

  return (
    <AuthProvider>
    <div className="min-h-screen bg-zinc-50">
      <div className="lg:flex lg:items-start lg:justify-start">
        <aside className={`hidden lg:block lg:flex-shrink-0 border-r border-zinc-200 bg-white transition-width duration-200 ${collapsed ? "w-20" : "w-64"} h-screen`}>
          <AdminSidebar 
            collapsed={collapsed} 
            onClose={() => setOpen(false)} 
            open={open} 
            onToggleCollapse={() => setCollapsed((s) => !s)}
            onNavigate={handleNavigate}
            currentView={currentView}
          />
        </aside>

        <div className="flex flex-1 flex-col min-h-screen">
          <div className="border-b border-zinc-200 bg-white">
            <AdminTopbar onOpenSidebar={() => setOpen(true)} />
          </div>

          <main className="mx-auto w-full max-w-5xl px-6 py-8">{renderContent()}</main>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative w-80 bg-white shadow-xl h-screen">
              <div className="h-screen">
                <AdminSidebar 
                  open={open} 
                  onClose={() => setOpen(false)} 
                  collapsed={false} 
                  onToggleCollapse={() => setCollapsed((s) => !s)}
                  onNavigate={handleNavigate}
                  currentView={currentView}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthProvider>
  );
}
