"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export default function BlockingLoader({
  show,
  text = "Loading…",
}: {
  show: boolean;
  text?: string;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  if (!show) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative rounded-2xl bg-white px-5 py-4 shadow-2xl ring-1 ring-black/10 flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <div className="text-sm font-medium text-gray-800">{text}</div>
      </div>
    </div>,
    document.body,
  );
}
