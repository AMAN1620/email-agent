"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const TYPE_COLORS: Record<string, string> = {
  lead: "#60a5fa",
  transaction: "#4ade80",
  invoice: "#fbbf24",
  unknown: "#71717a",
};

const PAYEE_COLORS = ["#60a5fa", "#4ade80", "#fbbf24", "#f87171", "#a78bfa"];

interface Props {
  activity: { date: string; count: number }[];
  breakdown: Record<string, number>;
  topPayees: { name: string; amount: number }[];
}

export function OverviewCharts({ activity, breakdown, topPayees }: Props) {
  const breakdownData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily activity bar chart */}
      <Card className="lg:col-span-2 bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#e4e4e7" }}
              />
              <Bar dataKey="count" fill="#60a5fa" radius={[3, 3, 0, 0]} name="Emails" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type breakdown pie */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={breakdownData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {breakdownData.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "#71717a"} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 12, color: "#a1a1aa", textTransform: "capitalize" }}>{v}</span>}
              />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 6, fontSize: 12 }}
                formatter={(v: number, name: string) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top payees */}
      {topPayees.length > 0 && (
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Payees by Spend (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topPayees} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number) => [`₹${v.toFixed(0)}`, "Spend"]}
                />
                {topPayees.map((_, i) => null)}
                <Bar dataKey="amount" radius={[0, 3, 3, 0]} name="Spend">
                  {topPayees.map((_, i) => (
                    <Cell key={i} fill={PAYEE_COLORS[i % PAYEE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
