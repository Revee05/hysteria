"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "../api-client";

const AuthContext = createContext(null);
const REFRESH_BEFORE_EXPIRY = 10; // Refresh 10 detik sebelum expired

export function AuthProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const tokenExpiryRef = useRef(null); // unix seconds

  // Load CSRF token saat aplikasi dimulai
  useEffect(() => {
    async function loadCsrf() {
      try {
        // Try read csrf token from cookie first to avoid extra network call
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent('csrfToken') + '=([^;]*)'))
          if (match) {
            setCsrfToken(decodeURIComponent(match[1]))
            // Check if we have access token
            const hasAccessToken = document.cookie.includes('accessToken=')
            setIsAuthenticated(hasAccessToken)
            return
          }
        }

        const res = await fetch("/api/auth/csrf", { cache: "no-store" });
        const json = await res.json();
        if (json?.data?.csrfToken) {
          setCsrfToken(json.data.csrfToken);
        }
      } catch (error) {
        console.error("Failed to load CSRF token:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCsrf();
  }, []);

  // Auto-refresh token mechanism
  useEffect(() => {
    if (!isAuthenticated || !csrfToken) {
      return;
    }

    // Function untuk refresh access token
    const refreshAccessToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        return;
      }

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
          // If server returns accessTokenExpiry (unix seconds), use it
          const expiry = json?.data?.accessTokenExpiry || null;
          if (expiry) {
            tokenExpiryRef.current = expiry;
          }
          console.log("Token refreshed successfully");
          // Schedule next refresh
          scheduleNextRefresh(tokenExpiryRef.current);
        } else {
          console.error("Token refresh failed:", res.status);
          setIsAuthenticated(false);
          // Redirect to login
          window.location.href = "/auth/login";
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        setIsAuthenticated(false);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Schedule next token refresh. If `expiryUnixSec` provided, schedule relative to that.
    const scheduleNextRefresh = (expiryUnixSec) => {
      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // If we have expiry from server, schedule relative to it. Otherwise use short fallback.
      if (expiryUnixSec) {
        const nowSec = Math.floor(Date.now() / 1000);
        const ms = (expiryUnixSec - REFRESH_BEFORE_EXPIRY - nowSec) * 1000;
        const interval = Math.max(ms, 5000); // at least 5s
        refreshTimerRef.current = setTimeout(() => refreshAccessToken(), interval);
      } else {
        // fallback: try again shortly to obtain expiry
        refreshTimerRef.current = setTimeout(() => refreshAccessToken(), 5000);
      }
    };

    // Start the refresh cycle: immediately attempt to get current expiry
    // This will also schedule the next refresh based on server-provided expiry.
    (async () => {
      await refreshAccessToken();
    })();

    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, csrfToken]);

  // Function untuk refresh CSRF token jika diperlukan
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

  // Set authenticated state after login
  const setAuthenticated = useCallback((value) => {
    setIsAuthenticated(value);
  }, []);

  // Wrapper untuk API calls dengan CSRF token otomatis
  const apiCall = useCallback(
    async (url, options = {}) => {
      return apiFetch(url, options, csrfToken);
    },
    [csrfToken]
  );

  const value = {
    csrfToken,
    refreshCsrf,
    apiCall,
    isLoading,
    isAuthenticated,
    setAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
