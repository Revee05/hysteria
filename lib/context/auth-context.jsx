"use client";

import { createContext, useContext, useEffect, useReducer, useCallback, useRef, useMemo } from "react";
import { apiFetch } from "../api-client";
import Toast from "../../components/ui/Toast";

// Separate contexts for state and actions
const AuthStateContext = createContext(null);
const AuthActionsContext = createContext(null);

const REFRESH_BEFORE_EXPIRY = 10;
const MIN_REFRESH_INTERVAL = 5000;

// Auth reducer for centralized state management
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CSRF_TOKEN':
      return { ...state, csrfToken: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        toast: action.payload?.toast || state.toast,
      };
    case 'INIT_SUCCESS':
      return {
        ...state,
        csrfToken: action.payload.csrfToken,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      };
    case 'INIT_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  csrfToken: "",
  isLoading: true,
  isAuthenticated: false,
  user: null,
  toast: { visible: false, message: "", type: "error" },
};

export function AuthProvider({ children }) {
  // Use reducer instead of multiple useState
  const [state, dispatch] = useReducer(authReducer, initialState);

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
        dispatch({ type: 'SET_USER', payload: json.data.user });
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
        dispatch({ type: 'SET_CSRF_TOKEN', payload: json.data.csrfToken });
        return json.data.csrfToken;
      }
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
    }
    return state.csrfToken;
  }, [state.csrfToken]);

  // Helper: API wrapper with CSRF token
  const apiCall = useCallback(
    async (url, options = {}) => {
      return apiFetch(url, options, state.csrfToken);
    },
    [state.csrfToken]
  );

  // Set authenticated state
  const setAuthenticated = useCallback((value) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: value });
  }, []);

  // Set user
  const setUser = useCallback((value) => {
    dispatch({ type: 'SET_USER', payload: value });
  }, []);

  // Effect: Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Try to get CSRF token first
        const csrfRes = await fetch("/api/auth/csrf", { cache: "no-store" });
        const csrfJson = await csrfRes.json();
        const csrf = csrfJson?.data?.csrfToken || "";

        // Try to get current user to check if authenticated
        const userRes = await apiFetch('/api/auth/me', { method: 'GET', credentials: 'include' });
        
        // Check if response is ok (200-299)
        if (userRes.ok) {
          const userJson = await userRes.json().catch(() => null);
          
          if (mounted && userJson?.success && userJson.data?.user) {
            dispatch({
              type: 'INIT_SUCCESS',
              payload: {
                csrfToken: csrf,
                user: userJson.data.user,
                isAuthenticated: true,
              },
            });
            return; // Early return on success
          }
        }
        
        // If we reach here, user is not authenticated (401, 403, or invalid response)
        if (mounted) {
          dispatch({
            type: 'INIT_SUCCESS',
            payload: {
              csrfToken: csrf,
              user: null,
              isAuthenticated: false,
            },
          });
        }
      } catch (error) {
        // Only log if it's not a network/fetch error
        if (error.name !== 'TypeError') {
          console.error("Failed to initialize auth:", error);
        }
        if (mounted) {
          dispatch({ type: 'INIT_FAILURE' });
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []); // Run only once on mount

  // Effect: Auto-refresh access token
  useEffect(() => {
    if (!state.isAuthenticated || !state.csrfToken) return;

    const refreshAccessToken = async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": state.csrfToken,
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
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          if (typeof window !== "undefined") window.location.href = "/auth/login";
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
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
  }, [state.isAuthenticated, state.csrfToken]);

  // Effect: Global event listeners for auth events and logout message
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onTokenRefreshed = () => {
      refreshUser().catch(() => {});
    };

    const handleForceLogout = (e) => {
      const message = e?.detail?.message || "Sesi Anda kedaluwarsa. Silakan login kembali.";
      dispatch({ type: 'SET_TOAST', payload: { visible: true, message, type: "error" } });
    };

    const handleSessionExpired = (e) => {
      const message = e?.detail?.message || "Sesi berakhir. Silakan login kembali.";
      dispatch({ type: 'SET_TOAST', payload: { visible: true, message, type: "error" } });
    };

    // Check for persisted logout message
    try {
      const stored = sessionStorage.getItem('auth:logoutMessage');
      if (stored) {
        dispatch({ type: 'SET_TOAST', payload: { visible: true, message: stored, type: 'error' } });
        sessionStorage.removeItem('auth:logoutMessage');
      }
    } catch (e) {
      console.error("Failed to read logout message:", e);
    }

    window.addEventListener('token-refreshed', onTokenRefreshed);
    window.addEventListener("force-logout", handleForceLogout);
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener('token-refreshed', onTokenRefreshed);
      window.removeEventListener("force-logout", handleForceLogout);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [refreshUser]);

  // Memoize state object to prevent unnecessary re-renders
  const stateValue = useMemo(() => ({
    csrfToken: state.csrfToken,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }), [state.csrfToken, state.isLoading, state.isAuthenticated, state.user]);

  // Memoize actions object to prevent unnecessary re-renders
  const actionsValue = useMemo(() => ({
    refreshCsrf,
    apiCall,
    setAuthenticated,
    setUser,
    refreshUser,
  }), [refreshCsrf, apiCall, setAuthenticated, setUser, refreshUser]);

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
        {state.toast.visible && <Toast message={state.toast.message} type={state.toast.type} />}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Hook to access auth state (read-only)
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within AuthProvider');
  }
  return context;
}

// Hook to access auth actions
export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within AuthProvider');
  }
  return context;
}

// Legacy hook for backward compatibility
export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
}