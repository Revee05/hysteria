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

  // Refresh user profile when sheet opens — only if we don't already have `user`
  useEffect(() => {
    if (!open) return;
    // If user data is already present in context, no need to refresh
    if (user) return;
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
  }, [open, refreshUser, user]);

  return (
    <Sheet open={open} onClose={onClose} panelClassName="rounded-l-xl overflow-hidden">

        {/* header sheet profile */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-lg font-semibold text-zinc-900">Profile</h2>
          <button
            ref={closeRef}
            aria-label="Close profile"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-zinc-100 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Isi kontent sheet profile */}
        <div className="px-4 py-3">
            <div className="flex flex-col items-center gap-2">
            <Avatar
              className="h-16 w-16 rounded-full bg-transparent overflow-hidden"
              hoverBorderColor="#60A5FA"
              hoverBorderWidth={1}
              hoverScale={1.06}
              src={user?.avatar || user?.photo || user?.image || user?.profilePicture || ''}
              alt={user?.name || 'User'}
            />
            <div className="text-sm font-semibold text-zinc-900">{user?.name ?? (loading ? 'Memuat...' : 'Pengguna')}</div>
            <div className="text-xs text-zinc-600">{user?.email ?? ''}</div>
          </div>

          <div className="mt-4">
            {user ? (
              <>
                {user.roles?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-zinc-500 mb-1">Roles</div>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((r) => (
                        <span key={r} className="text-sm bg-zinc-100 px-2 py-1 rounded-full text-zinc-700">{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* permissions intentionally omitted from UI */}
              </>
            ) : (
              <div className="mt-4 space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="text-sm font-medium">Placeholder Item</div>
                      <div className="text-xs text-zinc-500">Detail placeholder</div>
                    </div>
                    <button className="text-sm text-zinc-500 hover:text-zinc-700">Open</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Keluar
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-700">Yakin ingin keluar?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      if (!csrfToken) return;
                      setLoading(true);
                      try {
                        await apiCall('/api/auth/logout', { method: 'POST' });
                      } catch (e) {
                        // ignore and continue to redirect
                      }
                      setLoading(false);
                      setShowConfirm(false);
                      onClose();
                      router.push('/auth/login');
                    }}
                    disabled={loading || !csrfToken}
                    className="flex-1 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Keluar...' : 'Keluar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Sheet>
  );
}
