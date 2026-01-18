"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "./AdminTopbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import { AuthProvider } from "../../../lib/context/auth-context.jsx";

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AuthProvider>
    <div className="min-h-screen bg-zinc-50">
      <div className="lg:flex lg:items-start lg:justify-start">
        <aside className={`hidden lg:block lg:flex-shrink-0 border-r border-zinc-200 bg-white transition-width duration-200 ${collapsed ? "w-20" : "w-64"} h-screen`}>
          <AdminSidebar collapsed={collapsed} onClose={() => setOpen(false)} open={open} onToggleCollapse={() => setCollapsed((s) => !s)} />
        </aside>

        <div className="flex flex-1 flex-col min-h-screen">
          <div className="border-b border-zinc-200 bg-white">
            <AdminTopbar onOpenSidebar={() => setOpen(true)} />
          </div>

          <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative w-80 bg-white shadow-xl h-screen">
              <div className="h-screen">
                <AdminSidebar open={open} onClose={() => setOpen(false)} collapsed={false} onToggleCollapse={() => setCollapsed((s) => !s)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthProvider>
  );
}
