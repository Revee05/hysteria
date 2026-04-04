"use client";

import { formatDate } from "@/lib/utils/formatDate";

export default function Table({ headers, data = [], type }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          {headers.map((h) => (
            <th key={h} className="py-2 font-semibold text-zinc-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={headers.length} className="py-4 text-center text-zinc-400">
              Tidak ada data
            </td>
          </tr>
        )}

        {data.map((item) => (
          <tr key={item.id} className="border-b hover:bg-zinc-50 transition">
            <td className="py-3">{item.title}</td>

            {type === "event" && (
              <>
                <td>{formatDate(item.startAt)}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.isPublished
                        ? "bg-green-100 text-green-600"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {item.isPublished ? "Publish" : "Draft"}
                  </span>
                </td>
              </>
            )}

            {type === "article" && (
              <>
                <td>{item.authorName}</td>
                <td>{formatDate(item.createdAt)}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}