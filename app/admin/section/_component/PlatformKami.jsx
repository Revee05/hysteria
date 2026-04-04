"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "../../../../lib/context/auth-context";
import Card from "../../../../components/ui/Card";
import Toast from "../../../../components/ui/Toast";

const FALLBACK_CARDS = [
  { title: "Hysteria Artlab", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 0, linkUrl: "/platform/hysteria-artlab" },
  { title: "Peka Kota", imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764b0d?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 1, linkUrl: "/platform/peka-kota" },
  { title: "Laki Masak", imageUrl: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80", slotType: "tall", order: 2, linkUrl: "/platform/laki-masak" },
  { title: "Bukit Buku", imageUrl: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80", slotType: "short", order: 3, linkUrl: "/platform/bukit-buku" },
  { title: "Ditam Part", imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80", slotType: "short", order: 4, linkUrl: "/platform/ditampart" },
];

function defaultCard(index) {
  return {
    title: FALLBACK_CARDS[index]?.title || `Card ${index + 1}`,
    imageUrl: FALLBACK_CARDS[index]?.imageUrl || "",
    linkUrl: FALLBACK_CARDS[index]?.linkUrl || "",
    slotType: index < 3 ? "tall" : "short",
    order: index,
    isActive: true,
  };
}

function normalizePlatformCards(cards) {
  const incoming = Array.isArray(cards) ? cards : [];

  const normalized = incoming
    .map((card, index) => ({
      title: card?.title || "",
      imageUrl: card?.imageUrl || "",
      linkUrl: card?.linkUrl || "",
      slotType: card?.slotType === "short" ? "short" : "tall",
      order: Number.isInteger(card?.order) ? card.order : index,
      isActive: card?.isActive !== false,
    }))
    .sort((a, b) => a.order - b.order);

  while (normalized.length < 5) {
    normalized.push(defaultCard(normalized.length));
  }

  return normalized.slice(0, 5).map((card, index) => ({
    ...card,
    order: Number.isInteger(card.order) ? card.order : index,
    slotType: card.slotType === "short" ? "short" : "tall",
    isActive: true,
  }));
}

export default function PlatformKami() {
  const { apiCall, csrfToken } = useAuth();

  const [platformCards, setPlatformCards] = useState(() => Array.from({ length: 5 }, (_, index) => defaultCard(index)));
  const [platformLoading, setPlatformLoading] = useState(true);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const fetchPlatformSettings = useCallback(async () => {
    setPlatformLoading(true);
    try {
      const res = await apiCall("/api/admin/homepage-platform", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error?.message || "Gagal memuat pengaturan Platform Kami");
      }

      const cards = Array.isArray(json?.data?.cards) ? json.data.cards : [];
      setPlatformCards(normalizePlatformCards(cards));
    } catch (error) {
      console.error("Error fetching homepage platform settings:", error);
      setToast({ visible: true, message: error?.message || "Gagal memuat pengaturan Platform Kami", type: "error" });
    } finally {
      setPlatformLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchPlatformSettings();
  }, [fetchPlatformSettings]);

  const slotSummary = useMemo(() => {
    const tallCount = platformCards.filter((card) => card.slotType === "tall").length;
    const shortCount = platformCards.filter((card) => card.slotType === "short").length;
    return { tallCount, shortCount };
  }, [platformCards]);

  const handlePlatformCardChange = (index, field, value) => {
    setPlatformCards((prev) =>
      prev.map((card, cardIndex) => {
        if (cardIndex !== index) return card;

        if (field === "slotType") {
          return { ...card, slotType: value === "short" ? "short" : "tall" };
        }

        if (field === "file") {
          return { ...card, file: value };
        }

        return { ...card, [field]: value };
      }),
    );
  };

  const dragSrcIndex = useRef(null);

  const onDragStart = (e, index) => {
    dragSrcIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, targetIndex) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === undefined) return;

    setPlatformCards((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(src, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((card, idx) => ({ ...card, order: idx }));
    });

    dragSrcIndex.current = null;
  };

  const validatePlatformCards = () => {
    if (!Array.isArray(platformCards) || platformCards.length !== 5) {
      return "Jumlah kartu harus tepat 5";
    }

    const missingTitle = platformCards.some((card) => !String(card.title || "").trim());
    if (missingTitle) {
      return "Semua kartu harus memiliki judul";
    }

    const tallCount = platformCards.filter((card) => card.slotType === "tall").length;
    const shortCount = platformCards.filter((card) => card.slotType === "short").length;
    if (tallCount !== 3 || shortCount !== 2) {
      return "Komposisi slot harus 3 Tall dan 2 Short";
    }

    const orderValues = platformCards.map((card) => Number(card.order));
    if (new Set(orderValues).size !== orderValues.length) {
      return "Order tidak boleh duplikat";
    }

    return null;
  };

  const handleSavePlatformCards = async () => {
    const validationError = validatePlatformCards();
    if (validationError) {
      setToast({ visible: true, message: validationError, type: "error" });
      return;
    }

    setPlatformSaving(true);
    try {
      const payloadCards = platformCards.map((card) => ({
        title: String(card.title || "").trim(),
        imageUrl: card.imageUrl || null,
        linkUrl: card.linkUrl || null,
        slotType: card.slotType,
        order: Number(card.order),
        isActive: true,
      }));

      const hasFiles = platformCards.some((card) => card && card.file);
      let res;
      if (hasFiles) {
        const fd = new FormData();
        fd.append("cards", JSON.stringify(payloadCards));
        platformCards.forEach((card, idx) => {
          if (card && card.file) {
            fd.append(`image_${idx}`, card.file);
          }
        });

        res = await fetch("/api/admin/homepage-platform", {
          method: "PUT",
          body: fd,
          credentials: "include",
          headers: { "x-csrf-token": csrfToken || "" },
        });
      } else {
        res = await apiCall("/api/admin/homepage-platform", {
          method: "PUT",
          body: JSON.stringify({ cards: payloadCards }),
        });
      }

      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error?.message || "Gagal menyimpan pengaturan Platform Kami");
      }

      const nextCards = Array.isArray(json?.data?.cards) ? json.data.cards : payloadCards;
      setPlatformCards(normalizePlatformCards(nextCards));
      setToast({ visible: true, message: "Pengaturan Platform Kami berhasil disimpan", type: "success" });
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menyimpan pengaturan Platform Kami", type: "error" });
    } finally {
      setPlatformSaving(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Platform Kami Management</h2>
            <p className="mt-1 text-sm text-zinc-600">Kelola 5 kartu homepage sebagai entitas mandiri tanpa relasi ke model platform.</p>
          </div>
          <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
            Tall {slotSummary.tallCount} / Short {slotSummary.shortCount}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-700">
          <p className="font-medium text-zinc-800">Panduan singkat</p>
          <p className="mt-1">Drag untuk mengurutkan kartu. Judul, link, gambar, dan komposisi slot disimpan langsung pada kartu.</p>
          <p>Sizing info:</p>
          <p>Tall: dipakai untuk 3 kartu baris pertama (rasio sekitar 66.66%).</p>
          <p>Short: dipakai untuk 2 kartu baris kedua (rasio sekitar 40%).</p>
          <p>Komposisi wajib: 3 Tall + 2 Short.</p>
        </div>

        {platformLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">Loading platform settings...</div>
        ) : (
          <div className="space-y-4">
            {platformCards.map((card, index) => (
              <Card
                key={`platform-card-${index}`}
                className="shadow-sm"
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
                icon={
                  <button
                    type="button"
                    className="cursor-grab rounded-md border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50"
                    title="Drag untuk mengurutkan kartu">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path d="M7 5h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" />
                    </svg>
                  </button>
                }
                title={`Card #${index + 1}`}
                subtitle={`${card.title || `Card ${index + 1}`} • ${card.slotType === "short" ? "Short" : "Tall"}`}
                actions={
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${card.slotType === "short" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{card.slotType === "short" ? "Short" : "Tall"}</span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600">Drag to reorder</span>
                  </div>
                }>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700">Order disimpan otomatis</span>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700">Standalone card</span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="space-y-1 text-xs text-zinc-700">
                      <span className="block font-medium text-zinc-800">Slot Type</span>
                      <select
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        value={card.slotType}
                        onChange={(e) => handlePlatformCardChange(index, "slotType", e.target.value)}>
                        <option value="tall">Tall</option>
                        <option value="short">Short</option>
                      </select>
                    </label>

                    <label className="space-y-1 text-xs text-zinc-700">
                      <span className="block font-medium text-zinc-800">Title</span>
                      <input
                        type="text"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        value={card.title}
                        onChange={(e) => handlePlatformCardChange(index, "title", e.target.value)}
                        placeholder="Nama kartu"
                      />
                    </label>

                    <label className="space-y-2 text-xs text-zinc-700 lg:col-span-2">
                      <span className="block font-medium text-zinc-800">Gambar</span>
                      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1 text-sm text-zinc-600">
                            <p className="font-medium text-zinc-800">Upload gambar baru untuk kartu homepage ini.</p>
                            <p className="text-xs text-zinc-500">Format image apa pun yang didukung browser, maksimal 5MB saat disimpan.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-pink-700"
                              onChange={(e) => handlePlatformCardChange(index, "file", e.target.files && e.target.files[0])}
                            />
                            {(card.file || card.imageUrl) && (
                              <Image
                                src={card.file && typeof card.file === "object" ? URL.createObjectURL(card.file) : card.imageUrl}
                                alt="preview"
                                width={48}
                                height={48}
                                unoptimized
                                className="h-12 w-12 rounded-lg border border-zinc-200 object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="space-y-1 text-xs text-zinc-700 lg:col-span-2">
                      <span className="block font-medium text-zinc-800">Destination Link (opsional)</span>
                      <input
                        type="text"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        value={card.linkUrl}
                        onChange={(e) => handlePlatformCardChange(index, "linkUrl", e.target.value)}
                        placeholder="/platform/hysteria-artlab atau https://..."
                      />
                    </label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            disabled={platformSaving || platformLoading}
            onClick={handleSavePlatformCards}>
            {platformSaving ? "Saving..." : "Save Homepage Cards"}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </Card>
  );
}
