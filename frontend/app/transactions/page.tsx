import { api } from "@/lib/api";
import { TransactionsTable } from "@/components/transactions-table";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { items, total } = await api.transactions(1, 100);
  return <TransactionsTable initialItems={items} total={total} />;
}
