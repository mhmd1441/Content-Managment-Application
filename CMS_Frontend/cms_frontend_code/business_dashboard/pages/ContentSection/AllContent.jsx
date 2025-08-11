import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, get_contentSections, getMenus } from "../../../src/services/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const fmt = (v) => v ?? "—";

export default function BusinessAllContent() {
  const [sections, setSections] = useState([]);
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
        const [sRes, mRes] = await Promise.all([get_contentSections(), getMenus()]);
        const s = Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || [];
        const m = Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || [];
        setSections(s);
        setMenus(m);
      } catch (e) {
        console.error(e);
        setErr("Failed to load content");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byId = new Map(menus.map(x => [String(x.id), x]));
  const items = useMemo(() => {
    let arr = sections.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter(x =>
        x.subtitle?.toLowerCase?.().includes(needle) ||
        x.description?.toLowerCase?.().includes(needle)
      );
    }
    return arr;
  }, [sections, q]);

  if (loading) return <div className="p-6 text-sm text-neutral-300">Loading…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      <div className="bd-hero">
        <div className="bd-eyebrow">Content</div>
        <h1 className="bd-title">All Content Sections</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input className="pl-8 bg-neutral-900/60 border-neutral-800 max-w-md" value={q} onChange={e => setQ(e.target.value)} placeholder="Search content…" />
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bd-card p-4">
            <div className="bd-content-row">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-neutral-100">{fmt(item.subtitle)}</div>
                <div className="text-sm text-neutral-400">{fmt(item.description)}</div>
                <div className="text-xs text-neutral-500 mt-2">
                  Category: {fmt(byId.get(String(item.menu_id))?.title)} · Status: {fmt(item.status)}
                </div>
              </div>
              <div className="flex items-center md:justify-end">
                {item.image_path ? (
                  <span className="bd-img"><img src={item.image_path} onError={(e)=>{e.currentTarget.closest('.bd-img').style.display='none';}} /></span>
                ) : <div className="text-neutral-500 text-sm">No image</div>}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-neutral-500">No content found.</div>}
      </div>
    </div>
  );
}
