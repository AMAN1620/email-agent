import { api } from "@/lib/api";
import { InvoicesTable } from "@/components/invoices-table";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { items, total } = await api.invoices(1, 100);
  return <InvoicesTable initialItems={items} total={total} />;
}
