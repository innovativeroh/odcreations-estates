"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  lead?: { _id: string; leadId: string };
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    api.get<{ notifications: NotificationItem[]; unreadCount: number }>("/api/notifications")
      .then((d) => { setItems(d.notifications); setUnreadCount(d.unreadCount); })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}/read`, {});
    load();
  }

  async function markAllRead() {
    await api.patch("/api/notifications/read-all", {});
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-xl border border-card-border hover:bg-neutral-500/5 text-txt-body hover:text-txt-title transition-all cursor-pointer bg-card-bg relative"
      >
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
          </>
        )}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 mt-1 w-80 bg-card-bg border border-card-border rounded-2xl shadow-xl z-50 p-2 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold text-txt-title">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] font-bold text-brand hover:underline cursor-pointer border-none bg-transparent">Mark all read</button>
            )}
          </div>
          <div className="h-px bg-card-border my-1" />
          {items.length === 0 && <p className="text-xs text-txt-muted text-center py-6">No notifications yet.</p>}
          {items.map((n) => (
            <Link
              key={n._id}
              href={n.lead ? `/dashboard/leads/${n.lead._id}` : "#"}
              onClick={() => !n.read && markRead(n._id)}
              className={`block px-3 py-2.5 rounded-xl text-xs transition-colors ${n.read ? "text-txt-muted" : "text-txt-title font-semibold bg-brand/5"}`}
            >
              <div>{n.message}</div>
              <div className="text-[10px] text-txt-sub mt-1 font-semibold">{formatDate(n.createdAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
