"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { TypeBadge } from "@/components/type-badge";
import { DeleteToolbar } from "@/components/delete-toolbar";
import { useDeletable } from "@/hooks/use-deletable";
import type { Transaction } from "@/lib/api";

export function TransactionsTable({ initialItems, total }: { initialItems: Transaction[]; total: number }) {
  const {
    items, selected, confirmOpen, isPending, allSelected,
    setConfirmOpen, toggleAll, toggleOne, requestDelete, confirmDelete,
  } = useDeletable(initialItems, "/transactions");

  const totalSpend = items
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} of {total} transactions · ₹{totalSpend.toFixed(0)} completed spend
          </p>
        </div>
        <DeleteToolbar
          count={selected.size} open={confirmOpen} isPending={isPending}
          onRequest={requestDelete} onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)} noun="transaction"
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
                <TableHead className="text-xs text-muted-foreground w-[100px]">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[120px]">Amount</TableHead>
                <TableHead className="text-xs text-muted-foreground">Payee</TableHead>
                <TableHead className="text-xs text-muted-foreground">Payer</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[130px]">Ref ID</TableHead>
                <TableHead className="text-xs text-muted-foreground w-[110px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((txn) => {
                const isSelected = selected.has(txn.message_id);
                return (
                  <TableRow key={txn.message_id}
                    className={`border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => toggleOne(txn.message_id)}>
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(txn.message_id)}
                        className="h-4 w-4 rounded accent-primary cursor-pointer" />
                    </TableCell>
                    <TableCell><TypeBadge type={txn.status} /></TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {txn.currency === "INR" ? "₹" : `${txn.currency} `}{txn.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{txn.payee || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground">{txn.payer || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{txn.transaction_id || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {txn.date || new Date(txn.received_at).toLocaleDateString("en-IN")}
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
