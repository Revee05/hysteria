"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";

import StatCard from "@/components/adminUI/Dashboard/StatCard";
import DashboardCard from "@/components/adminUI/Dashboard/DashboardCard";
import Activity from "@/components/adminUI/Dashboard/ActivityItem";
import Table from "@/components/adminUI/Dashboard/Table";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage({ onNavigate }) {
  const { apiCall, isLoading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [range, setRange] = useState("weekly");
  const [loading, setLoading] = useState(true);

  ////////////////////////////////////////////////////////
  // FETCH
  ////////////////////////////////////////////////////////

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [range, authLoading]);

  const fetchDashboard = async () => {
    try {
      const res = await apiCall(`/api/admin/dashboard?range=${range}`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  ////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////

  if (loading || authLoading) {
    return (
      <div className="p-6 text-sm text-zinc-500">Loading dashboard...</div>
    );
  }

  ////////////////////////////////////////////////////////
  // SAFE DATA
  ////////////////////////////////////////////////////////

  const stats = data?.stats || {};
  const recent = data?.recent || {};
  const analytics = data?.analytics || [];

  const activities = mergeActivities(recent.articles, recent.events);

  ////////////////////////////////////////////////////////
  // NAVIGATE
  ////////////////////////////////////////////////////////
  const handleNavigate = (view) => {
    if (typeof onNavigate === "function") {
      onNavigate(view);
    } else {
      console.warn("onNavigate not provided");
    }
  };

  ////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-md">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Overview of Hysteria platform</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Konten" value={stats.totalContent || 0} />
        <StatCard title="Program Aktif" value={stats.totalPrograms || 0} />
        <StatCard title="Event Aktif" value={stats.totalEvents || 0} />
        <StatCard title="Platform Konten" value={stats.totalPlatformContents || 0} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ACTIVITY */}
        <DashboardCard title="Recent Activity">
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada aktivitas</p>
          ) : (
            activities.map((item) => (
              <Activity key={item.id} text={item.title} time={item.date} />
            ))
          )}
        </DashboardCard>

        {/* CHART */}
        <DashboardCard
          title="Total Pengunjung"
          action={
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          }
        >
          {/* CHART */}
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                fontSize={10} 
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="article"
                name="Artikel"
                stroke="#ec4899"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="event"
                name="Event"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="platform"
                name="Platform"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <p className="mt-3 text-xs text-zinc-400">{getRangeLabel(range)}</p>
          {/* TOTAL */}
          <div className="mt-8">
            <p className="text-3xl font-bold text-zinc-900">
              {getTotalViews(analytics)}
            </p>
            <p className="text-xs text-zinc-500">
              Total Tayangan {getRangeTitle(range)}
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EVENT */}
        <DashboardCard
          title="Event Terbaru"
          action={
            <span
              onClick={() => handleNavigate("event")}
              className="text-xs text-pink-500 cursor-pointer"
            >
              Lihat semua
            </span>
          }
        >
          <Table
            headers={["Judul", "Tgl Acara", "Dibuat", "Status"]}
            data={recent.events || []}
            type="event"
          />
        </DashboardCard>

        {/* ARTICLE */}
        <DashboardCard
          title="Artikel Terbaru"
          action={
            <span
              onClick={() => handleNavigate("article")}
              className="text-xs text-pink-500 cursor-pointer"
            >
              Lihat semua
            </span>
          }
        >
          <Table
            headers={["Judul", "Penulis", "Dibuat"]}
            data={recent.articles || []}
            type="article"
          />
        </DashboardCard>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////

function mergeActivities(articles = [], events = []) {
  return [
    ...articles.map((a) => ({
      id: `article-${a.id}`,
      title: `Artikel dibuat: ${a.title}`,
      date: new Date(a.createdAt),
    })),
    ...events.map((e) => ({
      id: `event-${e.id}`,
      title: `Event dibuat: ${e.title}`,
      date: new Date(e.createdAt),
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 6);
}

function getTotalViews(data) {
  return data.reduce(
    (acc, item) =>
      acc + (item.article || 0) + (item.event || 0) + (item.platform || 0),
    0
  );
}

function getRangeLabel(range) {
  if (range === "weekly") return "7 hari terakhir";
  if (range === "monthly") return "30 hari terakhir";
  if (range === "yearly") return "12 bulan terakhir";
}

function getRangeTitle(range) {
  if (range === "weekly") return "Mingguan";
  if (range === "monthly") return "Bulanan";
  if (range === "yearly") return "Tahunan";
}
