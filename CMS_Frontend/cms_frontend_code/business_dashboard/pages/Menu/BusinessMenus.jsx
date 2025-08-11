import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initCsrf, getMenus } from "../../../src/services/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const fmt = (v) => v ?? "—";

export default function BusinessMenus() {
  const nav = useNavigate();
  const [menus, setMenus] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const res = await getMenus();
        const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMenus(arr);
      } catch (e) {
        console.error(e);
        setErr("Failed to load menus");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rootMenus = useMemo(() => {
    let list = menus.filter((m) => !m.parent_id);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (x) =>
          x.title?.toLowerCase?.().includes(needle) ||
          x.route?.toLowerCase?.().includes(needle)
      );
    }
    return list;
  }, [menus, q]);

  const childCount = (menuId) =>
    menus.filter((m) => m.parent_id === menuId).length;

  if (loading)
    return <div className="p-6 text-sm text-neutral-300">Loading menus…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      <section className="bd-hero">
        <div className="bd-eyebrow">Catalog</div>
        <h1 className="bd-title">All Menus</h1>
      </section>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search menus…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8 bg-neutral-900/60 border-neutral-800"
        />
      </div>

      {/* Grid of menus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rootMenus.map((m) => (
          <Card
            key={m.id}
            className="bd-card cursor-pointer"
            onClick={() => nav(`/business_dashboard/menu/${m.id}`)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-semibold text-neutral-100">
                {fmt(m.title)}
              </div>
              {m.description && (
                <div className="text-sm text-neutral-400 line-clamp-2">
                  {m.description}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="bd-pill">
                  {childCount(m.id)} sub-categories
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rootMenus.length === 0 && (
        <div className="text-neutral-500">No menus available.</div>
      )}
    </div>
  );
}
