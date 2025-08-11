import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { initCsrf, getMenus } from "../../../src/services/api";
import { Card, CardContent } from "@/components/ui/card";

const fmt = (v) => v ?? "—";

export default function BusinessMenuDetail() {
  const { menuId } = useParams();
  const nav = useNavigate();
  const [menus, setMenus] = useState([]);
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
        setErr("Failed to load menu detail");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const menu = menus.find((m) => String(m.id) === String(menuId));
  const children = useMemo(
    () => menus.filter((m) => String(m.parent_id) === String(menuId)),
    [menus, menuId]
  );

  if (loading)
    return <div className="p-6 text-sm text-neutral-300">Loading…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  return (
    <div className="bd-container space-y-5">
      <div className="text-sm text-neutral-400">
        <Link to="/business_dashboard" className="hover:underline">
          All Menus
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-200">{fmt(menu?.title)}</span>
      </div>

      <div className="bd-hero">
        <div className="bd-eyebrow">Menu</div>
        <h1 className="bd-title">{fmt(menu?.title)}</h1>
      </div>
      {menu?.description && (
        <div className="text-neutral-400">{menu.description}</div>
      )}

      {/* Children grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((c) => (
          <Card
            key={c.id}
            className="bd-card cursor-pointer"
            onClick={() =>
              nav(`/business_dashboard/menu/${menuId}/child/${c.id}`)
            }
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-semibold text-neutral-100">
                {fmt(c.title)}
              </div>
              {c.description && (
                <div className="text-sm text-neutral-400 line-clamp-2">
                  {c.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-neutral-500">No sub-categories for this menu.</div>
      )}
    </div>
  );
}
