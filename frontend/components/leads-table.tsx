"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteToolbar } from "@/components/delete-toolbar";
import { useDeletable } from "@/hooks/use-deletable";
import type { Lead } from "@/lib/api";

export function LeadsTable({ initialItems, total }: { initialItems: Lead[]; total: number }) {
  const {
    items, selected, confirmOpen, isPending, allSelected,
    setConfirmOpen, toggleAll, toggleOne, requestDelete, confirmDelete,
  } = useDeletable(initialItems, "/leads");

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">{items.length} of {total} leads captured</p>
        </div>
        <DeleteToolbar
          count={selected.size} open={confirmOpen} isPending={isPending}
          onRequest={requestDelete} onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)} noun="lead"
        />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-10 pl-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="h-4 w-4 rounded accent-primary cursor-pointer" />
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs text-muted-foreground">Company</TableHead>
                <TableHead className="text-xs text-muted-foreground">Email</TableHead>
                <TableHead className="text-xs text-muted-foreground">Intent</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[110px]">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((lead) => {
                const isSelected = selected.has(lead.message_id);
                return (
                  <TableRow key={lead.message_id}
                    className={`border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => toggleOne(lead.message_id)}>
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(lead.message_id)}
                        className="h-4 w-4 rounded accent-primary cursor-pointer" />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.company || "—"}</TableCell>
                    <TableCell>
                      {lead.email
                        ? <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:underline truncate block max-w-[180px]">{lead.email}</a>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">{lead.intent || "—"}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.received_at).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
