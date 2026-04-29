"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteToolbar } from "@/components/delete-toolbar";
import { useDeletable } from "@/hooks/use-deletable";
import type { Invoice } from "@/lib/api";

function isDue(dueDate: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function InvoicesTable({ initialItems, total }: { initialItems: Invoice[]; total: number }) {
  const {
    items, selected, confirmOpen, isPending, allSelected,
    setConfirmOpen, toggleAll, toggleOne, requestDelete, confirmDelete,
  } = useDeletable(initialItems, "/invoices");

  const totalOwed = items.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} of {total} invoices · ₹{totalOwed.toFixed(0)} total
          </p>
        </div>
        <DeleteToolbar
          count={selected.size} open={confirmOpen} isPending={isPending}
          onRequest={requestDelete} onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)} noun="invoice"
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
                <TableHead className="text-xs text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[140px]">Invoice #</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[120px]">Amount</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[130px]">Due Date</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[110px]">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((inv) => {
                const isSelected = selected.has(inv.message_id);
                return (
                  <TableRow key={inv.message_id}
                    className={`border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => toggleOne(inv.message_id)}>
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(inv.message_id)}
                        className="h-4 w-4 rounded accent-primary cursor-pointer" />
                    </TableCell>
                    <TableCell className="font-medium">{inv.vendor || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{inv.invoice_number || "—"}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {inv.currency === "INR" ? "₹" : `${inv.currency} `}{inv.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {inv.due_date
                        ? <span className={isDue(inv.due_date) ? "text-red-400 text-xs font-medium" : "text-muted-foreground text-xs"}>
                            {inv.due_date}{isDue(inv.due_date) ? " ⚠ overdue" : ""}
                          </span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(inv.received_at).toLocaleDateString("en-IN")}
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
