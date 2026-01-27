"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const DialogContext = createContext(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx.open;
}

export function DialogProvider({ children }) {
  const [state, setState] = useState({ open: false, opts: null, resolver: null });
  // render dialog inline (no portal) to avoid ref/state access during render

  const close = useCallback((result) => {
    setState((s) => {
      if (s.resolver) s.resolver(result);
      return { open: false, opts: null, resolver: null };
    });
  }, []);

  const open = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, opts, resolver: resolve });
    });
  }, []);

  // keyboard ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && state.open) close({ action: "cancel" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, close]);

  const contextValue = { open, close };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {state.open ? (
        <DialogShell opts={state.opts} onClose={() => close({ action: "cancel" })} onConfirm={(data) => close({ action: "confirm", data })} />
      ) : null}
    </DialogContext.Provider>
  );
}

function DialogShell({ opts = {}, onClose, onConfirm }) {
  const { title, content, footer, size = "md", closable = true } = opts;

  const sizeClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-200 opacity-100">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closable ? onClose : undefined} />
      </div>

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`} aria-modal="true" role="dialog">
        <div className={`w-full ${sizeClass} rounded-lg bg-white shadow-2xl ring-1 ring-zinc-100 transform transition-all duration-200 max-h-[80vh] flex flex-col`}>
          <header className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                {opts.icon ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {typeof opts.icon === 'string' ? opts.icon : opts.icon}
                  </div>
                ) : null}

                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 leading-tight">{title}</h3>
                  {opts.subtitle ? <p className="text-sm text-zinc-500 mt-1">{opts.subtitle}</p> : null}
                </div>
              </div>

              {closable ? (
                <button className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-600" onClick={onClose} aria-label="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </header>

          <div className="p-6 text-sm text-zinc-700 leading-relaxed overflow-y-auto flex-1">
            {typeof content === "function" ? content({ onClose, onConfirm }) : content}
          </div>

          <div className="px-6 py-4 border-t flex-shrink-0 flex justify-end gap-3 bg-gradient-to-b from-white/40 to-white/0">
            {footer ? (
              footer({ onClose, onConfirm })
            ) : (
              <>
                <button className="px-4 py-2 text-sm rounded-md border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50" onClick={onClose}>
                  Close
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md hover:from-indigo-700 hover:to-blue-700"
                  onClick={() => onConfirm && onConfirm(undefined)}
                >
                  Confirm
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DialogProvider;
export { DialogShell };
