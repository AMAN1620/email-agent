import { api } from "@/lib/api";
import { StatCard } from "@/components/stat-card";
import { Mail, Users, CreditCard, FileText, AlertCircle, IndianRupee } from "lucide-react";
import { OverviewCharts } from "@/components/overview-charts";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const stats = await api.stats();
  const { totals, breakdown, activity, top_payees } = stats;

  const fmt = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n.toFixed(0)}`;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time email processing metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Emails" value={totals.emails} icon={Mail} />
        <StatCard label="Leads" value={totals.leads} icon={Users} accent="text-blue-400" />
        <StatCard label="Transactions" value={totals.transactions} icon={CreditCard} accent="text-green-400" />
        <StatCard label="Invoices" value={totals.invoices} icon={FileText} accent="text-amber-400" />
        <StatCard label="Total Spend" value={fmt(totals.spend)} sub="completed only" icon={IndianRupee} accent="text-green-400" />
        <StatCard label="Failed" value={totals.failed} icon={AlertCircle} accent="text-red-400" />
      </div>

      <OverviewCharts activity={activity} breakdown={breakdown} topPayees={top_payees} />
    </div>
  );
}
