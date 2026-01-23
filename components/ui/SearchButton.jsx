"use client";

import { useState, useRef, useEffect } from "react";

export default function SearchButton({
  placeholder = "Search…",
  onSearch,
  debounceMs = 300,
  className = "",
  buttonClassName = "",
  openWrapperClassName = "",
  inputClassName = "",
  closeButtonClassName = "",
  renderIcon,
  renderCloseIcon,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // detect mobile (matches Tailwind 'sm' breakpoint: 640px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const handle = (e) => setIsMobile(e.matches);
    try {
      mq.addEventListener("change", handle);
    } catch (e) {
      mq.addListener(handle);
    }
    return () => {
      try {
        mq.removeEventListener("change", handle);
      } catch (e) {
        mq.removeListener(handle);
      }
    };
  }, []);

  // close when clicking outside or pressing Escape
  useEffect(() => {
    function handleDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // debounced onSearch
  useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(id);
  }, [value, onSearch, debounceMs]);

  const DefaultIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const DefaultClose = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const renderIconNode = () => {
    if (!renderIcon) return <DefaultIcon />;
    return typeof renderIcon === "function" ? renderIcon() : renderIcon;
  };

  const renderCloseNode = () => {
    if (!renderCloseIcon) return <DefaultClose />;
    return typeof renderCloseIcon === "function" ? renderCloseIcon() : renderCloseIcon;
  };

  // Mobile overlay variant when open
  if (open && isMobile) {
    return (
      <div className={`fixed inset-0 z-50 ${className}`}>
        <div className="bg-black/40 absolute inset-0" onClick={() => setOpen(false)} />
        <div className="relative p-4">
          <div ref={containerRef} className={`mx-auto w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md px-3 py-2 flex items-center gap-2 ${openWrapperClassName}`}>
            {renderIconNode()}
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className={`w-full outline-none bg-transparent text-sm text-zinc-700 dark:text-zinc-50 ${inputClassName}`}
            />
            <button
              aria-label="Close search"
              onClick={() => {
                setOpen(false);
                setValue("");
                if (onSearch) onSearch("");
              }}
              className={`p-1 rounded text-zinc-700 dark:text-zinc-50 ${closeButtonClassName}`}
            >
              {renderCloseNode()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!open ? (
        <button
          aria-label="Search"
          onClick={() => setOpen(true)}
          className={`p-2 rounded-md text-zinc-700 dark:text-zinc-50 ${buttonClassName}`}
        >
          {renderIconNode()}
        </button>
      ) : (
        <div className={`flex items-center gap-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-md px-2 py-1 ${openWrapperClassName}`}>
          {renderIconNode()}

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={`min-w-[160px] outline-none bg-transparent text-sm text-zinc-700 dark:text-zinc-50 ${inputClassName}`}
          />

          <button
            aria-label="Close search"
            onClick={() => {
              setOpen(false);
              setValue("");
              if (onSearch) onSearch("");
            }}
            className={`p-1 rounded text-zinc-700 dark:text-zinc-50 ${closeButtonClassName}`}
          >
            {renderCloseNode()}
          </button>
        </div>
      )}
    </div>
  );
}
