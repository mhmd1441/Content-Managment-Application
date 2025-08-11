import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  initCsrf,
  getMenus,
  get_contentSections,
} from "../../../src/services/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const fmt = (v) => v ?? "—";

export default function BusinessContentList() {
  const { menuId, childId } = useParams();
  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState([]);
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
        const [mRes, cRes] = await Promise.all([
          getMenus(),
          get_contentSections(),
        ]);
        const m = Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || [];
        const c = Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || [];
        setMenus(m);
        setSections(c);
      } catch (e) {
        console.error(e);
        setErr("Failed to load content");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const childMenu = menus.find((x) => String(x.id) === String(childId));
  // Filter content sections by `menu_id` === childId (adjust if your schema uses `parent_id`)
  const items = useMemo(() => {
    let arr = sections.filter((s) => String(s.menu_id) === String(childId));
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        (x) =>
          x.subtitle?.toLowerCase?.().includes(needle) ||
          x.description?.toLowerCase?.().includes(needle)
      );
    }
    return arr;
  }, [sections, childId, q]);

  if (loading)
    return <div className="p-6 text-sm text-neutral-300">Loading…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      {/* Breadcrumbs */}
      <div className="text-sm text-neutral-400">
        <Link to="/business_dashboard" className="hover:underline">
          All Menus
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/business_dashboard/menu/${menuId}`}
          className="hover:underline"
        >
          Menu {menuId}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-200">{fmt(childMenu?.title)}</span>
      </div>

      <div className="bd-hero">
        <div className="bd-eyebrow">Category</div>
        <h1 className="bd-title">{fmt(childMenu?.title)}</h1>
      </div>
      {childMenu?.description && (
        <div className="text-neutral-400">{childMenu.description}</div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search in this category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8 bg-neutral-900/60 border-neutral-800 max-w-md"
        />
      </div>

<div className="bd-sep my-2">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4"
          >
            <div className="space-y-1">
              <div className="text-lg font-semibold text-neutral-100">
                {fmt(item.subtitle)}
              </div>
              <div className="text-sm text-neutral-400 whitespace-pre-wrap">
                {fmt(item.description)}
              </div>
              {/* Optional meta line */}
              <div className="text-xs text-neutral-500 mt-2">
                Status: {fmt(item.status)} · Order: {fmt(item.order)} ·
                Published: {fmt(item.published_at)}
              </div>
            </div>
            <div className="flex items-center md:justify-end">
              {item.image_path ? (
                <span className="bd-img">
                  <img
                    src={item.image_path}
                    alt={item.subtitle || "content image"}
                    onError={(e) => {
                      e.currentTarget.closest(".bd-img").style.display = "none";
                    }}
                  />
                </span>
              ) : (
                <div className="text-neutral-500 text-sm">No image</div>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-neutral-500">
            No content found in this category.
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
