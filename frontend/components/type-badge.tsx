import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const config: Record<string, { label: string; class: string }> = {
  lead:        { label: "Lead",        class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  invoice:     { label: "Invoice",     class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  transaction: { label: "Transaction", class: "bg-green-500/15 text-green-400 border-green-500/20" },
  unknown:     { label: "Unknown",     class: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
  done:        { label: "Done",        class: "bg-green-500/15 text-green-400 border-green-500/20" },
  in_progress: { label: "Processing",  class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  failed:      { label: "Failed",      class: "bg-red-500/15 text-red-400 border-red-500/20" },
  completed:   { label: "Completed",   class: "bg-green-500/15 text-green-400 border-green-500/20" },
  pending:     { label: "Pending",     class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
};

export function TypeBadge({ type }: { type: string }) {
  const c = config[type] ?? { label: type, class: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", c.class)}>
      {c.label}
    </Badge>
  );
}
