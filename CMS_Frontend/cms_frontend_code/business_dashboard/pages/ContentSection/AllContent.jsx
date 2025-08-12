import { useEffect, useMemo, useRef, useState } from "react";
import {
  initCsrf,
  get_contentSections,
  getMenus,
} from "../../../src/services/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SortIcon from "@mui/icons-material/Sort";

const fmt = (v) => v ?? "—";

export default function BusinessAllContent() {
  const [sections, setSections] = useState([]);
  const [menus, setMenus] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  // per-item expand state (no hooks inside loops)
  const [expandedById, setExpandedById] = useState({});
  const toggle = (id) =>
    setExpandedById((p) => ({ ...p, [String(id)]: !p[String(id)] }));

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const [sRes, mRes] = await Promise.all([
          get_contentSections(),
          getMenus(),
        ]);
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

  const byId = useMemo(
    () => new Map(menus.map((x) => [String(x.id), x])),
    [menus]
  );

  const items = useMemo(() => {
    let arr = sections.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        (x) =>
          x.subtitle?.toLowerCase?.().includes(needle) ||
          x.description?.toLowerCase?.().includes(needle)
      );
    }
    return arr;
  }, [sections, q]);

  if (loading)
    return <div className="p-6 text-sm text-neutral-300">Loading…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      {/* Tiny CSS needed for 2-line clamp (kept inline so you don’t miss it) */}
      <style>{`
        .bd-line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Hero row: text left, icons right */}
      <div
        className="bd-hero"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="bd-eyebrow">Content</div>
          <h1 className="bd-title">All Content Sections</h1>
        </div>

        <div className="flex items-center gap-3">
          <FilterAltIcon className="cursor-pointer opacity-80 hover:opacity-100" />
          <SortIcon className="cursor-pointer opacity-80 hover:opacity-100" />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          className="pl-8 bg-neutral-900/60 border-neutral-800 max-w-md"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search content…"
        />
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const expanded = !!expandedById[String(item.id)];
          const menuTitle = fmt(byId.get(String(item.menu_id))?.title);
          const statusStr = fmt(item.status);
          const isPublished = String(statusStr).toLowerCase() === "published";

          return (
            <div key={item.id} className="bd-card p-4">
              <div className="bd-content-row flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                  {/* Title: bold, underline, subtle bg */}
                  <div className="text-lg font-extrabold">
                    <span className="underline decoration-2 underline-offset-4 bg-neutral-800/60 rounded px-2 py-0.5">
                      {fmt(item.subtitle)}
                    </span>
                  </div>

                  {/* Description: 2 lines + toggle */}
                  <div
                    className={`text-sm text-neutral-300 ${
                      expanded ? "" : "bd-line-clamp-2"
                    }`}
                  >
                    {fmt(item.description)}
                  </div>
                  <br />
                  {item.description && String(item.description).length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="text-xs text-neutral-400 hover:text-neutral-200 underline"
                    >
                      {expanded ? "Show less" : "Show more"}
                    </button>
                  )}
                  <br />
                  <br />
                  {/* Badges: Type & Status */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-0.5 text-xs text-neutral-200">
                      Type: {menuTitle}
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs border " +
                        (isPublished
                          ? "bg-emerald-900/40 border-emerald-700 text-emerald-200"
                          : "bg-amber-900/40 border-amber-700 text-amber-200")
                      }
                    >
                      Status: {statusStr}
                    </span>
                  </div>
                </div>

                {/* Right: image */}
                <div className="flex items-center md:justify-end">
                  {item.image_path ? (
                    <span className="bd-img block max-w-[220px] rounded overflow-hidden border border-neutral-800">
                      <img
                        src={item.image_path}
                        alt=""
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const el = e.currentTarget.closest(".bd-img");
                          if (el) el.style.display = "none";
                        }}
                      />
                    </span>
                  ) : (
                    <div className="text-neutral-500 text-sm">No image</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-neutral-500">No content found.</div>
        )}
      </div>
    </div>
  );
}
