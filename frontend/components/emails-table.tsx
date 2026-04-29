"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TypeBadge } from "@/components/type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ProcessedEmail } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function parseSender(raw: string) {
  const name = raw.replace(/<.*?>/, "").trim();
  const email = raw.match(/<(.+?)>/)?.[1] ?? "";
  return { name: name || email || "Unknown", email };
}

interface Props {
  initialItems: ProcessedEmail[];
  total: number;
}

export function EmailsTable({ initialItems, total }: Props) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allIds = items.map((e) => e.message_id);
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

  function handleDelete() {
    if (selected.size === 0) return;
    setConfirmOpen(true);
  }

  function confirmDelete() {
    const ids = [...selected];
    setConfirmOpen(false);
    startTransition(async () => {
      const res = await fetch(`${BASE}/emails`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }),
        },
        body: JSON.stringify({ message_ids: ids }),
      });
      if (!res.ok) {
        console.error(`Delete failed: ${res.status} ${res.statusText}`);
        return;
      }
      setItems((prev) => prev.filter((e) => !ids.includes(e.message_id)));
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Email Activity</h1>
          <p className="text-sm text-muted-foreground">{items.length} of {total} emails</p>
        </div>

        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selected.size} selected
          </Button>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {/* Select all checkbox */}
                <TableHead className="w-10 pl-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </TableHead>
                <TableHead className="text-xs text-muted-foreground w-[200px]">Sender</TableHead>
                <TableHead className="text-xs text-muted-foreground">Subject &amp; Preview</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[110px]">Received</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[80px]">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[150px]">Types</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((email) => {
                const isSelected = selected.has(email.message_id);
                const sender = parseSender(email.sender || "Unknown");

                return (
                  <TableRow
                    key={email.message_id}
                    className={`border-border align-top cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => toggleOne(email.message_id)}
                  >
                    {/* Row checkbox */}
                    <TableCell className="pl-4 pt-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(email.message_id)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </TableCell>

                    {/* Sender */}
                    <TableCell className="py-3">
                      <p className="text-sm font-medium truncate max-w-[185px]">{sender.name}</p>
                      {sender.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[185px]">{sender.email}</p>
                      )}
                    </TableCell>

                    {/* Subject + preview */}
                    <TableCell className="py-3">
                      <p className="text-sm font-medium truncate max-w-sm">
                        {email.subject || <span className="italic text-muted-foreground">No subject</span>}
                      </p>
                      {email.preview && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed max-w-sm">
                          {email.preview}
                        </p>
                      )}
                    </TableCell>

                    {/* Received */}
                    <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {email.received_at ? formatDate(email.received_at) : "—"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <TypeBadge type={email.status} />
                    </TableCell>

                    {/* Types */}
                    <TableCell className="py-3">
                      <div className="flex gap-1 flex-wrap">
                        {email.types_detected.length > 0
                          ? [...new Set(email.types_detected)].map((t, i) => (
                              <TypeBadge key={`${t}-${i}`} type={t} />
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} record{selected.size > 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected emails will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>Yes, delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
