"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "../../../lib/context/auth-context.jsx";

import AdminTopbar from "./AdminTopbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

// users
import Users from "../users/user_management/page.jsx";
import Permission from "../users/permission/page.jsx";
import StatusManagement from "../users/status_management/page.jsx";

// nav categories
import CategoriesPage from "../categories/page.jsx";

// platform
import HysteriaArtlabPage from "@/app/admin/platform/hysteria-artlab/page.jsx"
import DitampartPage from "@/app/admin/platform/ditampart/page.jsx"
import LakiMasakPage from "@/app/admin/platform/laki-masak/page.jsx"

// pages
import PageHome from "../section/PageHome.jsx";
import PageArtlab from "../section/PageArtlab.jsx";
import PageDitampart from "../section/PageDitampart.jsx";
import PageLakiMasak from "../section/PageLakiMasak.jsx";

//team
import TeamManagementPage from "../team/page.jsx";
// event
import EventPage from "../events/page.jsx";
import TentangSettingsPage from "../tentang/page.jsx";
import { usePathname } from "next/navigation";
import ArticlesPage from "../articles/page.jsx";
import CreateArticlePage from "../articles/create/page.jsx";

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

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

  const pathname = usePathname();
  const isDashboard = pathname === "/admin";

  const renderContent = () => {
    switch (currentView) {
      case "users":
      case "users.user_management":
        return <Users />;
      case "users.status_management":
        return <StatusManagement />;
      case "users.permission":
        return <Permission />;

      case "page":
      case "page.home":
        return <PageHome />;
      case "page.artlab":
        return <PageArtlab />;
      case "page.ditampart":
        return <PageDitampart />;
      case "page.laki-masak":
        return <PageLakiMasak />;
      case "category":
        return <CategoriesPage />;

      case "platform":
      case "platform.hysteria-artlab":
        return <HysteriaArtlabPage />;
      case "platform.ditampart":
        return <DitampartPage />;
      case "platform.laki-masak":
        return <LakiMasakPage />;

      case "team":
        return <TeamManagementPage />;

      case "article":
        return <ArticlesPage onNavigate={handleNavigate} />;
      case "article.create":
        return <CreateArticlePage onNavigate={handleNavigate} />;

      case "tentang":
        return <TentangSettingsPage />;

      case "event":
        return <EventPage />;
        
      case "dashboard":
      default:
        return children;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 via-pink-100 to-orange-100 justify-center">
        <div className="lg:flex lg:items-start lg:justify-start">
          <aside
            className={`hidden lg:block lg:flex-shrink-0 border-r border-zinc-200 bg-white transition-width duration-200 ${collapsed ? "w-20" : "w-64"} sticky top-0 h-screen overflow-hidden`}
          >
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

            <main className="flex-1 w-full px-6 py-8">
              {isDashboard ? renderContent() : children}
            </main>
          </div>

          {open && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/40"
                onClick={() => setOpen(false)}
              />
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
