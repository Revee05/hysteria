"use client";

/**
 * TablePlatformColom.js
 *
 * Kolom DataTable untuk menampilkan data Event (dari model Event via API).
 * Digunakan di halaman admin platform: ditampart, artlab, dan laki-masak
 * pada bagian tabel event (bawah halaman).
 *
 * Row shape (dari API /api/admin/platform-content/[platform]/events):
 *   id, title, poster, categories [{id, title, slug, isPrimary}],
 *   startAt, endAt, status (UPCOMING|ONGOING|FINISHED), isPublished, ...
 */

import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import { StatusBadge } from "./data.jsx";

// Map status internal → label bahasa Indonesia (sama dengan StatusBadge di data.js)
const STATUS_LABEL = {
  UPCOMING: "Akan Datang",
  ONGOING: "Sedang Berlangsung",
  FINISHED: "Berakhir",
};

/**
 * Bangun kolom DataTable untuk tabel event platform.
 *
 * @param {{ onEdit: (row: object) => void, onDelete: (row: object) => void }} callbacks
 * @returns {import("@/components/ui/DataTable").Column[]}
 */
export function buildEventColumns({ onEdit, onDelete, preferredCategorySlugs } = {}) {
  return [
    {
      field: "id",
      headerName: "ID",
      width: 60,
      freeze: true,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "poster",
      headerName: "Thumbnail",
      width: 90,
      align: "center",
      headerAlign: "center",
      render: (row) =>
        row.poster ? (
          <div className="flex items-center justify-center">
            <Image
              src={row.poster}
              alt={row.title ?? "poster"}
              width={56}
              height={40}
              className="rounded object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-14 h-10 bg-zinc-200 rounded flex items-center justify-center text-xs text-zinc-500">
            No img
          </div>
        ),
    },
    {
      field: "title",
      headerName: "Judul",
      width: 240,
      render: (row) => (
        <span className="font-medium text-zinc-800 line-clamp-2">
          {row.title ?? "-"}
        </span>
      ),
    },
    {
      field: "categories",
      headerName: "Sub Kategori",
      width: 180,
      render: (row) => {
        const cats = row.categories ?? [];
        if (!cats.length) return <span className="text-zinc-700 text-sm">-</span>;

        let ordered = [];
        if (preferredCategorySlugs?.length) {
          const preferredOrder = preferredCategorySlugs;
          const preferredCats = preferredOrder
            .map((slug) => cats.find((c) => c.slug === slug))
            .filter(Boolean);
          const rest = cats.filter((c) => !preferredOrder.includes(c.slug));
          ordered = [...preferredCats, ...rest];
        } else {
          const primary = cats.find((c) => c.isPrimary);
          const rest = cats.filter((c) => c !== primary);
          ordered = primary ? [primary, ...rest] : cats;
        }

        const titles = ordered.map((c) => c.title).filter(Boolean);
        return (
          <span className="text-zinc-700 text-sm">{titles.length ? titles.join(', ') : '-'}</span>
        );
      },
    },
    {
      field: "organizers",
      headerName: "Penyelenggara",
      width: 160,
      render: (row) => {
        const orgs = row.organizers ?? [];
        if (!orgs.length) return <span className="text-zinc-700 text-sm">-</span>;
        return (
          <span className="text-zinc-700 text-sm">
            {orgs.map((o) => o.title).filter(Boolean).join(", ")}
          </span>
        );
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 180,
      render: (row) => {
        const tags = row.tags ?? [];
        if (!tags.length) return <span className="text-zinc-700 text-sm">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-block px-1.5 py-0.5 rounded bg-pink-500 text-zinc-100 text-xs"
              >
                {t.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      field: "startAt",
      headerName: "Tanggal",
      width: 130,
      align: "center",
      headerAlign: "center",
      render: (row) => {
        if (!row.startAt) return "-";
        const d = new Date(row.startAt);
        return (
          <span className="text-zinc-700 text-sm">
            {d.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      field: "location",
      headerName: "Lokasi",
      width: 200,
      render: (row) => (
        <span className="text-zinc-700 text-sm line-clamp-2">
          {row.location ?? "-"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      align: "center",
      headerAlign: "center",
      render: (row) => (
        <StatusBadge status={STATUS_LABEL[row.status] ?? row.status} />
      ),
    },
    {
      field: "isPublished",
      headerName: "Publikasi",
      width: 100,
      align: "center",
      headerAlign: "center",
      render: (row) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            row.isPublished
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {row.isPublished ? "Publik" : "Draft"}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Aksi",
      width: 90,
      align: "center",
      headerAlign: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(row);
              }}
              className="text-blue-600 hover:bg-blue-50"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(row);
              }}
              className="text-red-500 hover:bg-red-50"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];
}