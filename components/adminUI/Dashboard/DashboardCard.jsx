"use client";

export default function DashboardCard({
  title,
  action,
  children,
  footer,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white
        border border-gray-300
        rounded-xl
        shadow-md
      hover:border-pink-500
        p-5
        ${className}
      `}
    >
      {/* HEADER */}
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl text-black">{title}</h3>

          {action && <div className="text-sm text-black">{action}</div>}
        </div>
      )}

      {/* BODY */}
      <div className="text-black">{children}</div>

      {/* FOOTER */}
      {footer && (
        <div className="mt-4 pt-3 border-t text-sm text-zinc-500">{footer}</div>
      )}
    </div>
  );
}
