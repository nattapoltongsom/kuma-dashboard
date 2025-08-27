"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarChart3, Home, ListChecks, X, type LucideIcon } from "lucide-react";
import Navbar from "./Navbar";

type Item = { name: string; href: string; icon: LucideIcon };

function DrawerMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const overview: Item[] = [{ name: "Summary", href: "/summary", icon: Home }];
  const campaigns: Item[] = [
    { name: "UNBOX", href: "/campaign/1", icon: BarChart3 },
    // { name: "KATO", href: "/campaign/2", icon: BarChart3 }, //Todo: remove comment
    // { name: "PETTO", href: "/campaign/3", icon: ListChecks },
  ];

  const [navLoading, setNavLoading] = useState(false);
  useEffect(() => {
    if (navLoading) setNavLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (open) onClose();
  }, [pathname]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href + "/") && href !== "/");

  const NavGroup = ({ title }: { title: string }) => (
    <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
      {title}
    </div>
  );

  const NavItem = ({ item }: { item: Item }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        prefetch={false}
        onClick={() => setNavLoading(true)}
        aria-current={active ? "page" : undefined}
        className={[
          "group relative flex items-center gap-3 rounded-xl px-3 py-2 transition",
          active
            ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
            : "text-gray-700 hover:bg-gray-50",
        ].join(" ")}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-gradient-to-b from-sky-400 to-indigo-400" />
        )}
        <Icon className="h-5 w-5 opacity-90" />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="relative h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
        <div className="flex h-14 items-center justify-between px-4">
          <div className="font-semibold text-gray-900">Menu</div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          <NavGroup title="Overview" />
          <nav className="space-y-1">
            {overview.map((it) => (
              <NavItem key={it.href} item={it} />
            ))}
          </nav>

          <div className="my-3 h-px bg-gray-200" />

          <NavGroup title="Campaigns" />
          <nav className="space-y-1">
            {campaigns.map((it) => (
              <NavItem key={it.href} item={it} />
            ))}
          </nav>
        </div>
      </aside>

      {navLoading && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-white/70 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
            <p className="text-sm text-gray-700">Loading…</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onMenu={() => setOpen(true)} />
      <main className="w-full p-4">{children}</main>
      <DrawerMenu
        open={open}
        onClose={() => setOpen(false)}
        pathname={pathname}
      />
    </div>
  );
}
