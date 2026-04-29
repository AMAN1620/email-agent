"use client";

import { useState, useTransition } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export function useDeletable<T extends { message_id: string }>(
  initialItems: T[],
  endpoint: string
) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allIds = items.map((i) => i.message_id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function requestDelete() {
    if (selected.size > 0) setConfirmOpen(true);
  }

  function confirmDelete() {
    const ids = [...selected];
    setConfirmOpen(false);
    startTransition(async () => {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }),
        },
        body: JSON.stringify({ message_ids: ids }),
      });
      if (!res.ok) {
        console.error(`Delete failed: ${res.status} ${res.statusText}`);
        return; // don't remove from UI if backend failed
      }
      setItems((prev) => prev.filter((i) => !ids.includes(i.message_id)));
      setSelected(new Set());
    });
  }

  return {
    items, selected, confirmOpen, isPending, allSelected,
    setConfirmOpen, toggleAll, toggleOne, requestDelete, confirmDelete,
  };
}
