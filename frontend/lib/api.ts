const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export interface Stats {
  totals: {
    emails: number;
    leads: number;
    transactions: number;
    invoices: number;
    failed: number;
    spend: number;
    invoices_amount: number;
  };
  breakdown: Record<string, number>;
  activity: { date: string; count: number }[];
  top_payees: { name: string; amount: number }[];
}

export interface Lead {
  message_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  intent: string;
  source: string;
  received_at: string;
}

export interface Transaction {
  message_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  date: string;
  payer: string;
  payee: string;
  status: "completed" | "pending" | "failed" | "unknown";
  received_at: string;
}

export interface Invoice {
  message_id: string;
  vendor: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  line_items: { description: string; quantity: number; unit_price: number; total: number }[];
  received_at: string;
}

export interface ProcessedEmail {
  message_id: string;
  status: "done" | "in_progress" | "failed";
  claimed_at: string;
  processed_at: string | null;
  attempts: number;
  types_detected: string[];
  error: string | null;
  sender: string;
  subject: string;
  preview: string;
  received_at: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export const api = {
  stats: () => get<Stats>("/stats"),
  emails: (page = 1, pageSize = 30) =>
    get<Paginated<ProcessedEmail>>("/emails", { page: String(page), page_size: String(pageSize) }),
  leads: (page = 1, pageSize = 30) =>
    get<Paginated<Lead>>("/leads", { page: String(page), page_size: String(pageSize) }),
  transactions: (page = 1, pageSize = 30) =>
    get<Paginated<Transaction>>("/transactions", { page: String(page), page_size: String(pageSize) }),
  invoices: (page = 1, pageSize = 30) =>
    get<Paginated<Invoice>>("/invoices", { page: String(page), page_size: String(pageSize) }),
};
