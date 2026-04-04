"use client";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:border-pink-500 p-5">
      <p className="text-3xl font-bold text-pink-500">{value ?? 0}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}
