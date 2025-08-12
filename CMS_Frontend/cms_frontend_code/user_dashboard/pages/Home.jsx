import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, getMenus, get_contentSections } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroCarousel from "../components/HeroCarousel";
import "../styles/user.css";


const fmt = (v) => v ?? "—";
const splitImages = (image_path) =>
  String(image_path || "")
    .split(/[,\s;|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

export default function UserHome() {
  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [activeParent, setActiveParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const [expanded, setExpanded] = useState(new Set()); 

  const did = useRef(false);
  const closeTimer = useRef(null);
  const railRef = useRef(null);

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const [mRes, sRes] = await Promise.all([getMenus(), get_contentSections()]);
        const m = Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || [];
        const s = Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || [];
        setMenus(m);
        setSections(s);
      } catch (e) {
        console.error(e);
        setErr("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const parents = useMemo(
    () => menus.filter(m => !m.parent_id).sort((a,b) => (a.order ?? 0) - (b.order ?? 0)),
    [menus]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map();
    menus.forEach(m => {
      if (m.parent_id) {
        const arr = map.get(m.parent_id) || [];
        arr.push(m);
        map.set(m.parent_id, arr);
      }
    });
    for (const [,v] of map) v.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    return map;
  }, [menus]);

  const items = useMemo(() => {
    if (!activeChild) return [];
    const list = sections
      .filter(x => String(x.menu_id) === String(activeChild))
      .sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    const def = new Set(list.filter(i => !!i.is_expanded).map(i => i.id));
    setExpanded(def);
    return list;
  }, [activeChild, sections]);

  const toggleRow = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollLeft  = () => { if (!railRef.current) return; railRef.current.scrollLeft -= 240; };
  const scrollRight = () => { if (!railRef.current) return; railRef.current.scrollLeft += 240; };

  const onBarEnter = (pid) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setActiveParent(pid);
  };
  const onMenusLeave = () => {
    closeTimer.current = setTimeout(() => setActiveParent(null), 200);
  };
  const onChildrenEnter = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  if (loading) return <div className="ud-container text-sm text-gray-600">Loading…</div>;
  if (err) return <div className="ud-container text-sm text-red-500">{err}</div>;

  return (
    <div className="ud-container space-y-6">
<HeroCarousel />

      <section className="space-y-2">
        <h2 className="ud-title">Explore</h2>
        <div className="ud-menubar" onMouseLeave={onMenusLeave}>
          <div className="ud-arrow left" onMouseDown={scrollLeft}>
            <ChevronLeft size={18} />
          </div>

          <div className="ud-menubar-rail" ref={railRef}>
            {parents.map(p => (
              <button
                key={p.id}
                className="ud-chip"
                onMouseEnter={() => onBarEnter(p.id)}
                onFocus={() => onBarEnter(p.id)}
                onClick={() => {
                  const kids = childrenByParent.get(p.id) || [];
                  if (kids.length === 1) setActiveChild(kids[0].id);
                }}
              >
                {fmt(p.title)}
              </button>
            ))}
          </div>

          <div className="ud-arrow right" onMouseDown={scrollRight}>
            <ChevronRight size={18} />
          </div>
        </div>

        {activeParent && (
          <div className="ud-children" onMouseEnter={onChildrenEnter} onMouseLeave={onMenusLeave}>
            {(childrenByParent.get(activeParent) || []).map(c => (
              <a
                key={c.id}
                className="ud-child"
                onClick={(e) => { e.preventDefault(); setActiveChild(c.id); }}
                href="#"
              >
                <div className="font-semibold">{fmt(c.title)}</div>
                {c.description && <div className="text-xs text-gray-500 line-clamp-2">{c.description}</div>}
              </a>
            ))}
            {!(childrenByParent.get(activeParent) || []).length && (
              <div className="text-sm text-gray-500">No sub-menus for this category.</div>
            )}
          </div>
        )}
      </section>

      {activeChild ? (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="ud-eyebrow">Content</div>
            <span className="ud-pill">Category ID: {activeChild}</span>
          </div>

          <div className="space-y-4">
            {items.map(item => {
              const imgs = splitImages(item.image_path);
              const grid = imgs.length === 0 ? "grid-cols-1"
                         : "md:grid-cols-4";
              const textSpan = imgs.length === 0 ? "col-span-1"
                            : imgs.length === 1 ? "md:col-span-3"
                            : "md:col-span-2";

              return (
                <Card key={item.id} className="ud-card">
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--ud-border)'}}>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{fmt(item.subtitle)}</span>
                      <span className="text-xs text-gray-500">Order: {fmt(item.order)}</span>
                      <span className="ud-pill">{fmt(item.status)}</span>
                    </div>
                    <button className="ud-expand-btn" onClick={() => toggleRow(item.id)}>
                      {expanded.has(item.id) ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  {expanded.has(item.id) && (
                    <CardContent className="p-4">
                      <div className={`grid ${grid} gap-3 items-start`}>
                        <div className={`${textSpan} text-sm whitespace-pre-wrap`}>
                          {fmt(item.description)}
                        </div>
                        {imgs.length >= 1 && (
                          <div className="md:col-span-1 flex md:justify-end">
                            <span className="ud-img">
                              <img src={imgs[0]} alt="image-1" onError={(e)=>{e.currentTarget.closest('.ud-img').style.display='none';}} />
                            </span>
                          </div>
                        )}
                        {imgs.length >= 2 && (
                          <div className="md:col-span-1 flex md:justify-end">
                            <span className="ud-img">
                              <img src={imgs[1]} alt="image-2" onError={(e)=>{e.currentTarget.closest('.ud-img').style.display='none';}} />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-3">
                        Published: {fmt(item.published_at)} · Created By: {fmt(item.created_by)} · Updated By: {fmt(item.updated_by)}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {!items.length && <div className="text-gray-500 text-sm">No content in this category yet.</div>}
          </div>
        </section>
      ) : (
        <section className="text-gray-600 text-sm">Pick a child menu above to view its content.</section>
      )}
    </div>
  );
}
