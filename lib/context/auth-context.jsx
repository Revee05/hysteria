"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "../api-client";
import Toast from "../../components/ui/Toast";

const AuthContext = createContext(null);
const REFRESH_BEFORE_EXPIRY = 10;
const MIN_REFRESH_INTERVAL = 5000;

export function AuthProvider({ children }) {
  // State
  const [csrfToken, setCsrfToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  // Refs
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const tokenExpiryRef = useRef(null);

  // Helper: Read cookie value
  const getCookie = useCallback((name) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  // Helper: Refresh user profile
  const refreshUser = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me', { method: 'GET', credentials: 'include' });
      const json = await res.json().catch(() => null);
      if (json?.success && json.data?.user) {
        setUser(json.data.user);
        return json.data.user;
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
    return null;
  }, []);

  // Helper: Refresh CSRF token
  const refreshCsrf = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/csrf", { cache: "no-store" });
      const json = await res.json();
      if (json?.data?.csrfToken) {
        setCsrfToken(json.data.csrfToken);
        return json.data.csrfToken;
      }
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
    }
    return csrfToken;
  }, [csrfToken]);

  // Helper: API wrapper with CSRF token
  const apiCall = useCallback(
    async (url, options = {}) => {
      return apiFetch(url, options, csrfToken);
    },
    [csrfToken]
  );

  // Set authenticated state
  const setAuthenticated = useCallback((value) => {
    setIsAuthenticated(value);
  }, []);

  // Effect: Auto-refresh access token
  useEffect(() => {
    if (!isAuthenticated || !csrfToken) return;

    const refreshAccessToken = async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          const expiry = json?.data?.accessTokenExpiry || null;
          if (expiry) tokenExpiryRef.current = expiry;
          scheduleNextRefresh(tokenExpiryRef.current);
        } else {
          console.error("Token refresh failed:", res.status);
          setIsAuthenticated(false);
          if (typeof window !== "undefined") window.location.href = "/auth/login";
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        setIsAuthenticated(false);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    const scheduleNextRefresh = (expiryUnixSec) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      if (expiryUnixSec) {
        const nowSec = Math.floor(Date.now() / 1000);
        const ms = (expiryUnixSec - REFRESH_BEFORE_EXPIRY - nowSec) * 1000;
        const interval = Math.max(ms, MIN_REFRESH_INTERVAL);
        refreshTimerRef.current = setTimeout(refreshAccessToken, interval);
      }
    };

    scheduleNextRefresh(tokenExpiryRef.current);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, csrfToken]);

  // Effect: Load user profile when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }

    let mounted = true;
    (async () => {
      const u = await refreshUser();
      if (mounted && u) {
        // User loaded
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, refreshUser]);

  // Effect: Global event listeners for auth events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onTokenRefreshed = () => {
      refreshUser().catch(() => {});
    };

    const handleForceLogout = (e) => {
      const message = e?.detail?.message || "Sesi Anda kedaluwarsa. Silakan login kembali.";
      setToast({ visible: true, message, type: "error" });
    };

    const handleSessionExpired = (e) => {
      const message = e?.detail?.message || "Sesi berakhir. Silakan login kembali.";
      setToast({ visible: true, message, type: "error" });
    };

    window.addEventListener('token-refreshed', onTokenRefreshed);
    window.addEventListener("force-logout", handleForceLogout);
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener('token-refreshed', onTokenRefreshed);
      window.removeEventListener("force-logout", handleForceLogout);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [refreshUser]);

  // Effect: Show persisted logout message
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = sessionStorage.getItem('auth:logoutMessage');
      if (stored) {
        setToast({ visible: true, message: stored, type: 'error' });
        sessionStorage.removeItem('auth:logoutMessage');
      }
    } catch (e) {
      console.error("Failed to read logout message:", e);
    }
  }, []);

  const value = {
    csrfToken,
    refreshCsrf,
    apiCall,
    isLoading,
    isAuthenticated,
    setAuthenticated,
    user,
    setUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast.visible && <Toast message={toast.message} type={toast.type} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}