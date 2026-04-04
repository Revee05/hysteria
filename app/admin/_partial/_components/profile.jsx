"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/context/auth-context";
import { Avatar } from "../../../../components/ui/icon";
import Sheet from "../../../../components/ui/SheetDialog";

export default function ProfileSheet({ open, onClose }) {
  const closeRef = useRef(null);
  const router = useRouter();
  const { apiCall, csrfToken, user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      // focus close button for accessibility
      setTimeout(() => closeRef.current?.focus(), 0);
      // prevent body scroll while sheet is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Refresh user profile when sheet opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        await refreshUser();
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [open, refreshUser]);

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        avatar: user.avatar || "",
      });
    }
  }, [user, isEditing]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    // Create a local URL for immediate preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.password) data.append("password", formData.password);
      if (avatarFile) data.append("file", avatarFile);

      const res = await apiCall("/api/auth/me", {
        method: "PATCH",
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal memperbarui profil");
      }

      await refreshUser();
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      alert(err.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelClassName="rounded-l-xl overflow-hidden"
    >
      {/* header sheet profile */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEditing ? "Edit Profile" : "Profile"}
        </h2>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Sunting profil"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <button
            ref={closeRef}
            aria-label="Close profile"
            onClick={() => {
              if (isEditing) setIsEditing(false);
              else onClose();
            }}
            className="p-2 rounded-md hover:bg-zinc-100 cursor-pointer text-zinc-600 hover:text-zinc-900"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M4 4l12 12M16 4L4 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Isi kontent sheet profile */}
      <div className="px-4 py-3 h-[calc(100vh-50px)] overflow-y-auto">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative group">
            {/* avatar */}
            <div className="rounded-full ring overflow-visible">
              <Avatar
                size={80}
                className="rounded-full shadow-sm"
                src={formData.avatar || ""}
                alt={user?.name || "User"}
                borderColor="transparent"
                borderWidth={0}
                hoverScale={isEditing ? 1 : 1.05}
              />
            </div>
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex flex-col items-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-[10px] text-white font-medium mt-1">
                    Ubah Foto
                  </span>
                </div>
              </label>
            )}
          </div>
          {/* name and email saat bukan edit*/}
          {!isEditing && (
            <div className="text-center mt-2">
              <div className="text-lg font-bold text-zinc-900 leading-tight">
                {user?.name ?? (loading ? "Memuat..." : "Pengguna")}
              </div>
              <div className="text-sm text-zinc-500 mt-0.5">
                {user?.email ?? ""}
              </div>
            </div>
          )}
        </div>

        {/* form edit profile */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="Nama Lengkap"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Kata Sandi Baru (kosongkan jika tidak ingin diubah)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E83C91] rounded-lg hover:bg-pink-400 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              {user ? (
                <>
                  {user.roles?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-zinc-800 uppercase tracking-wider mb-2">
                        Roles
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className="text-[11px] font-semibold bg-pink-100 px-2.5 py-1 rounded text-pink-500"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-zinc-50 border border-zinc-100 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-300 pt-6">
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar
                </button>
              ) : (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm font-medium text-red-800 mb-3 text-center">
                    Yakin ingin keluar dari akun ini?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 rounded-lg bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        if (!csrfToken) return;
                        setLoading(true);
                        try {
                          await apiCall("/api/auth/logout", { method: "POST" });
                        } catch (e) {
                          // ignore and continue to redirect
                        }
                        setLoading(false);
                        setShowConfirm(false);
                        onClose();
                        router.push("/auth/login");
                      }}
                      disabled={loading || !csrfToken}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-sm"
                    >
                      {loading ? "Keluar..." : "Ya, Keluar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
