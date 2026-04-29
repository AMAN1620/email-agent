import { api } from "@/lib/api";
import { LeadsTable } from "@/components/leads-table";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { items, total } = await api.leads(1, 100);
  return <LeadsTable initialItems={items} total={total} />;
}
