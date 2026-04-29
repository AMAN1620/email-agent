"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, Users, CreditCard, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/invoices", label: "Invoices", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-border">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight">Email Agent</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">Polling every 2 min</p>
      </div>
    </aside>
  );
}
