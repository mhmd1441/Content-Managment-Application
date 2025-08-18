import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  DollarSign, Users, Activity, Percent,
  TrendingUp, TrendingDown,
  GripVertical, MoreHorizontal
} from "lucide-react";

/* ---------- utils ---------- */
const fmtNum = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : n;

const fmtMoney = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function makeSeries(days) {
  const out = [];
  const now = new Date();
  let v = 80;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    v += (Math.sin(i / 3) * 5) + (Math.random() * 6 - 3);
    v = Math.max(10, Math.round(v));
    out.push({
      label: `${months[d.getMonth()]} ${d.getDate()}`,
      value: v,
    });
  }
  return out;
}

/* ---------- tiny UI pieces ---------- */
function StatCard({ title, value, hint, delta, positive, icon }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#18181B] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A1A1AA]">{title}</p>
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold text-white">
        {typeof value === "number" && title.toLowerCase().includes("revenue")
          ? fmtMoney(value)
          : typeof value === "number"
          ? fmtNum(value)
          : value}
      </div>
      <p className="mt-1 text-sm text-[#A1A1AA]">{hint}</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        {positive ? (
          <TrendingUp className="h-4 w-4 text-[#22C55E]" />
        ) : (
          <TrendingDown className="h-4 w-4 text-[#EF4444]" />
        )}
        <span className={positive ? "text-[#22C55E]" : "text-[#EF4444]"}>
          {delta}
        </span>
      </div>
    </div>
  );
}

function PillButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 text-sm rounded-md border " +
        (active
          ? "bg-[#3B82F6] text-white border-[#3B82F6]"
          : "text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#3B82F6]")
      }
    >
      {children}
    </button>
  );
}

function SectionTab({ label, count, active = false }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm " +
        (active
          ? "bg-[#0F0F0F] text-white border-[#2A2A2D]"
          : "bg-[#18181B] text-[#A1A1AA] border-[#2A2A2D] hover:text-white")
      }
    >
      {label}
      {typeof count === "number" && (
        <span className="ml-1 rounded-full bg-[#27272A] px-2 py-0.5 text-xs text-[#A1A1AA]">{count}</span>
      )}
    </span>
  );
}

function StatusPill({ color = "green", label }) {
  const map = {
    green: { dot: "#22C55E", bg: "#0b2817", border: "#134e31", text: "#CFFAEA" },
    blue:  { dot: "#3B82F6", bg: "#0a1f36", border: "#1e3a8a", text: "#DBEAFE" },
    gray:  { dot: "#A1A1AA", bg: "#202022", border: "#2a2a2d", text: "#E5E7EB" },
  };
  const c = map[color] ?? map.gray;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.dot }} />
      {label}
    </span>
  );
}

function KebabButton() {
  return (
    <button className="rounded-md p-1.5 border border-transparent hover:border-[#27272A] hover:bg-[#0F0F0F]">
      <MoreHorizontal className="h-4 w-4 text-[#A1A1AA]" />
    </button>
  );
}

/* ---------- page ---------- */
export default function AnalyticsDashboard() {
  const [range, setRange] = useState("90d"); // 90d | 30d | 7d
  const data = useMemo(() => {
    if (range === "7d") return makeSeries(7);
    if (range === "30d") return makeSeries(30);
    return makeSeries(90);
  }, [range]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {/* header + actions */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-[#27272A] bg-[#0F0F0F] px-3 py-2 text-sm text-[#A1A1AA] hover:text-white">
              Customize Columns
            </button>
            <button className="rounded-md border border-[#1f3b72] bg-[#3B82F6] px-3 py-2 text-sm text-white">
              + Add Section
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={1250}
            hint="Trending up this month"
            delta="+12.8%"
            positive
            icon={<DollarSign className="h-5 w-5 text-[#A1A1AA]" />}
          />
          <StatCard
            title="New Customers"
            value={1234}
            hint="Down 20% this period"
            delta="−20%"
            positive={false}
            icon={<Users className="h-5 w-5 text-[#A1A1AA]" />}
          />
          <StatCard
            title="Active Accounts"
            value={45678}
            hint="Strong user retention"
            delta="+12.5%"
            positive
            icon={<Activity className="h-5 w-5 text-[#A1A1AA]" />}
          />
          <StatCard
            title="Growth Rate"
            value="4.5%"
            hint="Steady performance increase"
            delta="+4.5%"
            positive
            icon={<Percent className="h-5 w-5 text-[#A1A1AA]" />}
          />
        </div>

        {/* chart card */}
        <div className="mt-6 rounded-xl border border-[#27272A] bg-[#18181B] p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A1A1AA]">Total Visitors</p>
              <p className="text-xs text-[#A1A1AA]">Total for the selected range</p>
            </div>
            <div className="flex gap-2">
              <PillButton active={range === "90d"} onClick={() => setRange("90d")}>
                Last 3 months
              </PillButton>
              <PillButton active={range === "30d"} onClick={() => setRange("30d")}>
                Last 30 days
              </PillButton>
              <PillButton active={range === "7d"} onClick={() => setRange("7d")}>
                Last 7 days
              </PillButton>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="visGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FFFFFF" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.06} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#27272A" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#A1A1AA", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#27272A" }}
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#A1A1AA", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#27272A" }}
                width={40}
              />
              <Tooltip
                contentStyle={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 8, color: "#FFFFFF" }}
                labelStyle={{ color: "#A1A1AA" }}
                formatter={(v) => [v, "Visitors"]}
              />
              <Area type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} fill="url(#visGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 rounded-xl border border-[#27272A] bg-[#18181B] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <SectionTab active label="Outline" />
              <SectionTab label="Past Performance" count={3} />
              <SectionTab label="Key Personnel" count={2} />
              <SectionTab label="Focus Documents" />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-[#27272A] bg-[#0F0F0F] px-3 py-2 text-sm text-[#A1A1AA] hover:text-white">
                Customize Columns
              </button>
              <button className="rounded-md border border-[#1f3b72] bg-[#3B82F6] px-3 py-2 text-sm text-white">
                + Add Section
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-t border-[#27272A]">
              <thead className="bg-[#18181B]/80 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-[#18181B]/75">
                <tr className="text-left text-sm text-[#A1A1AA]">
                  <th className="w-10 px-3 py-3"></th>
                  <th className="px-5 py-3 font-medium">Header</th>
                  <th className="px-5 py-3 font-medium">Section Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Limit</th>
                  <th className="px-5 py-3 font-medium">Reviewer</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272A]">
                {/* Row 1 */}
                <tr className="group hover:bg-[#151516] transition-colors">
                  <td className="px-3 py-3 text-[#6B7280]">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                      <input type="checkbox" className="h-4 w-4 rounded border-[#3A3A3D] bg-transparent" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white">Cover page</td>
                  <td className="px-5 py-3 text-[#A1A1AA]">
                    <span className="rounded-full border border-[#3A3A3D] bg-[#0F0F0F] px-2 py-0.5 text-xs">
                      Cover page
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill color="blue" label="In Process" />
                  </td>
                  <td className="px-5 py-3">16</td>
                  <td className="px-5 py-3">5</td>
                  <td className="px-5 py-3">Eddie Lake</td>
                  <td className="px-3 py-3"><KebabButton /></td>
                </tr>

                {/* Row 2 */}
                <tr className="group hover:bg-[#151516] transition-colors">
                  <td className="px-3 py-3 text-[#6B7280]">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                      <input type="checkbox" className="h-4 w-4 rounded border-[#3A3A3D] bg-transparent" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white">Table of contents</td>
                  <td className="px-5 py-3 text-[#A1A1AA]">
                    <span className="rounded-full border border-[#3A3A3D] bg-[#0F0F0F] px-2 py-0.5 text-xs">
                      Table of contents
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill color="green" label="Done" />
                  </td>
                  <td className="px-5 py-3">29</td>
                  <td className="px-5 py-3">24</td>
                  <td className="px-5 py-3">Eddie Lake</td>
                  <td className="px-3 py-3"><KebabButton /></td>
                </tr>

                {/* Row 3 */}
                <tr className="group hover:bg-[#151516] transition-colors">
                  <td className="px-3 py-3 text-[#6B7280]">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                      <input type="checkbox" className="h-4 w-4 rounded border-[#3A3A3D] bg-transparent" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white">Executive summary</td>
                  <td className="px-5 py-3 text-[#A1A1AA]">
                    <span className="rounded-full border border-[#3A3A3D] bg-[#0F0F0F] px-2 py-0.5 text-xs">
                      Narrative
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill color="green" label="Done" />
                  </td>
                  <td className="px-5 py-3">10</td>
                  <td className="px-5 py-3">13</td>
                  <td className="px-5 py-3">Eddie Lake</td>
                  <td className="px-3 py-3"><KebabButton /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#27272A] px-5 py-3 text-sm text-[#A1A1AA]">
            <span>0 of 68 row(s) selected.</span>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2">
                <span>Rows per page</span>
                <select className="bg-[#0F0F0F] border border-[#27272A] rounded-md px-2 py-1 text-[#A1A1AA]">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="inline-flex items-center gap-1">
                <button className="px-2 py-1 rounded-md border border-[#27272A] hover:bg-[#0F0F0F]">«</button>
                <button className="px-2 py-1 rounded-md border border-[#27272A] hover:bg-[#0F0F0F]">‹</button>
                <span className="px-2">Page 1 of 7</span>
                <button className="px-2 py-1 rounded-md border border-[#27272A] hover:bg-[#0F0F0F]">›</button>
                <button className="px-2 py-1 rounded-md border border-[#27272A] hover:bg-[#0F0F0F]">»</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
