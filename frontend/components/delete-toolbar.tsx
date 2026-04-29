"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  count: number;
  open: boolean;
  isPending: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  noun?: string;
}

export function DeleteToolbar({ count, open, isPending, onRequest, onConfirm, onCancel, noun = "record" }: Props) {
  return (
    <>
      {count > 0 && (
        <Button variant="destructive" size="sm" onClick={onRequest} disabled={isPending} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete {count} selected
        </Button>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete {count} {noun}{count > 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected {noun}s will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isPending}>Yes, delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
