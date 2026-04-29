import { api } from "@/lib/api";
import { EmailsTable } from "@/components/emails-table";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const { items, total } = await api.emails(1, 100);
  return <EmailsTable initialItems={items} total={total} />;
}
