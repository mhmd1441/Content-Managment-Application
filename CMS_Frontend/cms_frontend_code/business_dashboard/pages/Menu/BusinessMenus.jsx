import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initCsrf, getMenus, delete_menu } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";                 
import { Search } from "lucide-react";
import Loader from "@/lib/loading.jsx";

const fmt = (v) => v ?? "—";

function getChildren(all, id) {
  return all.filter((m) => String(m.parent_id) === String(id));
}
function getDescendants(all, rootId) {
  const out = [];
  const queue = [...getChildren(all, rootId)];
  while (queue.length) {
    const n = queue.shift();
    out.push(n);
    queue.push(...getChildren(all, n.id));
  }
  return out;
}

export default function BusinessMenus() {
  const nav = useNavigate();
  const [menus, setMenus] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  async function load() {
    setLoading(true);
    try {
      await initCsrf();
      const res = await getMenus();
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMenus(arr);
      setErr(null);
    } catch (e) {
      console.error(e);
      setErr("Failed to load menus");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    load();
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

  const childCount = (menuId) => menus.filter((m) => String(m.parent_id) === String(menuId)).length;

  async function handleDelete(menu) {
    const hasParent = menu.parent_id != null;
    const descendants = getDescendants(menus, menu.id);

    if (hasParent || descendants.length > 0) {
      const parentLine = hasParent
        ? `• Has parent: ${menus.find(m => String(m.id) === String(menu.parent_id))?.title ?? `#${menu.parent_id}`} (ID ${menu.parent_id})`
        : null;

      const childLines =
        descendants.length > 0
          ? `• Has ${descendants.length} ${descendants.length === 1 ? "child" : "children"}:\n` +
            descendants.map(d => `   - ${d.title ?? "(untitled)"} (#${d.id})`).join("\n")
          : null;

      const msg = [
        `Cannot delete "${menu.title ?? "(untitled)"}" (#${menu.id}).`,
        parentLine,
        childLines,
        "Only menus with NO parent and NO children can be deleted.",
      ].filter(Boolean).join("\n");

      alert(msg);
      return;
    }

    const ok = window.confirm(
      `Delete menu "${menu.title ?? "(untitled)"}" (#${menu.id})?\nThis action cannot be undone.`
    );
    if (!ok) return;

    try {
      await initCsrf();
      await delete_menu(menu.id);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  }

  function handleUpdate(menu) {
    nav(`/business_dashboard/menu/edit/${menu.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" aria-busy="true">
        <Loader />
      </div>
    );
  }
  if (err) return <div role="alert" className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      <section className="bd-hero">
        <div className="bd-eyebrow">Catalog</div>
        <h1 className="bd-title">All Menus</h1>
      </section>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search menus…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8 bg-neutral-900/60 border-neutral-800"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rootMenus.map((m) => (
          <Card key={m.id} className="bd-card">
            <CardContent className="p-4 space-y-3">
              <div className="text-lg font-semibold text-neutral-100">
                {fmt(m.title)}
              </div>

              {m.description && (
                <div className="text-sm text-neutral-400 line-clamp-2">
                  {m.description}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {childCount(m.id)} sub-categories
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-neutral-800 hover:bg-neutral-700"
                    onClick={() => handleUpdate(m)}
                    title="Update menu"
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(m)}
                    title="Delete menu"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <button
                type="button"
                className="absolute inset-0 z-0"
                aria-label={`Open menu ${fmt(m.title)}`}
                onClick={(e) => {
                  if ((e.target).closest("button[title]")) return;
                  nav(`/business_dashboard/menu/${m.id}`);
                }}
                style={{ pointerEvents: "none" }}
                aria-hidden
              />
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
