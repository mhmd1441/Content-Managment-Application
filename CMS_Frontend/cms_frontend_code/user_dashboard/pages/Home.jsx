import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, getMenus, get_contentSections } from "@/services/api";
import HeroCarousel from "../components/HeroCarousel";
import "../styles/user.css";

const Card = ({ className = "", ...props }) => (
  <div className={`ud-card ${className}`} {...props} />
);
const CardContent = ({ className = "", ...props }) => (
  <div className={className} {...props} />
);

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

  // Active selections
  const [activeMenuId, setActiveMenuId] = useState(null); // can be parent or child
  const [openTopByClick, setOpenTopByClick] = useState(null);
  const [hoverTopId, setHoverTopId] = useState(null);

  // left sidebar (click + hover)
  const [openLeftByClick, setOpenLeftByClick] = useState(null);
  const [hoverLeftId, setHoverLeftId] = useState(null);

  // which parent’s submenu is actually shown
  const shownTopParent = hoverTopId ?? openTopByClick;
  const shownLeftParent = hoverLeftId ?? openLeftByClick;
  const [expanded, setExpanded] = useState(new Set());

  const did = useRef(false);
  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const [mRes, sRes] = await Promise.all([
          getMenus(),
          get_contentSections(),
        ]);
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

  // Parents split by position
  const parents = useMemo(
    () =>
      menus
        .filter((m) => !m.parent_id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [menus]
  );
  const topParents = useMemo(
    () => parents.filter((p) => (p.position || "top") === "top").slice(0, 10),
    [parents]
  );
  const leftParents = useMemo(
    () => parents.filter((p) => p.position === "left").slice(0, 10),
    [parents]
  );

  // Children map
  const childrenByParent = useMemo(() => {
    const map = new Map();
    menus.forEach((m) => {
      if (m.parent_id) {
        const arr = map.get(m.parent_id) || [];
        arr.push(m);
        map.set(m.parent_id, arr);
      }
    });
    for (const [, v] of map) v.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return map;
  }, [menus]);

  // Content items for whichever menu id is active (parent or child)
  const items = useMemo(() => {
    if (!activeMenuId) return [];
    const list = sections
      .filter((x) => String(x.menu_id) === String(activeMenuId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const def = new Set(list.filter((i) => !!i.is_expanded).map((i) => i.id));
    setExpanded(def);
    return list;
  }, [activeMenuId, sections]);


  const toggleRow = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading)
    return <div className="ud-container text-sm text-gray-600">Loading…</div>;
  if (err)
    return <div className="ud-container text-sm text-red-500">{err}</div>;

  return (
    <div className="ud-container space-y-5">
      <HeroCarousel />

      {/* LAYOUT: left sidebar (left menus) + main column */}
      <div className={`ud-layout ${leftParents.length ? "has-side" : ""}`}>
        {/* LEFT SIDEBAR (position='left') */}
        {leftParents.length > 0 && (
          <aside className="ud-side" onMouseLeave={() => setHoverLeftId(null)}>
            <div className="ud-side-title">Browse</div>
            <ul className="ud-side-list">
              {leftParents.map((p) => {
                const kids = childrenByParent.get(p.id) || [];
                const isActive = shownLeftParent === p.id;
                return (
                  <li
                    key={p.id}
                    className="ud-side-block"
                    onMouseEnter={() => setHoverLeftId(p.id)}
                  >
                    <button
                      className={`ud-side-item ${
                        shownLeftParent === p.id ? "is-active" : ""
                      }`}
                      onClick={() => {
                        const kids = childrenByParent.get(p.id) || [];
                        if (kids.length === 0) {
                          // no children → open parent content
                          setActiveMenuId(p.id);
                          return;
                        }
                        setOpenLeftByClick((prev) =>
                          prev === p.id ? null : p.id
                        ); // toggle
                      }}
                      onFocus={() => setHoverLeftId(p.id)} // keyboard focus behaves like hover
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          (childrenByParent.get(p.id) || []).length === 0
                        ) {
                          e.preventDefault();
                          setActiveMenuId(p.id);
                        }
                      }}
                      aria-expanded={shownLeftParent === p.id}
                    >
                      {fmt(p.title)}
                    </button>

                    {isActive && (
                      <div className="ud-side-children">
                        {kids.length > 0 ? (
                          kids.map((c) => (
                            <button
                              key={c.id}
                              className={`ud-side-child ${
                                String(activeMenuId) === String(c.id)
                                  ? "is-active"
                                  : ""
                              }`}
                              onClick={() => setActiveMenuId(c.id)}
                            >
                              {fmt(c.title)}
                            </button>
                          ))
                        ) : (
                          <div className="ud-side-empty">No sub-menus.</div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* MAIN COLUMN */}
        <main className="ud-maincol space-y-5">
          {/* TOP MENUS (position='top') */}
          {topParents.length > 0 && (
            <section className="space-y-2">
              <h2 className="ud-title">Explore</h2>

              {/* evenly distributed grid, max 10 items, no scroll, no arrows */}
              <div
                className="ud-menubar"
                onMouseLeave={() => setHoverTopId(null)}
              >
                <div className="ud-menubar-grid">
                  {topParents.map((p) => (
                    <button
                      key={p.id}
                      className={`ud-chip ${
                        shownTopParent === p.id ? "is-active" : ""
                      }`}
                      onMouseEnter={() => setHoverTopId(p.id)} // hover shows submenu
                      onFocus={() => setHoverTopId(p.id)} // keyboard focus behaves like hover
                      onClick={() => {
                        const kids = childrenByParent.get(p.id) || [];
                        if (kids.length === 0) {
                          // no children → open parent content
                          setActiveMenuId(p.id);
                          return;
                        }
                        // toggle on click
                        setOpenTopByClick((prev) =>
                          prev === p.id ? null : p.id
                        );
                      }}
                      aria-expanded={shownTopParent === p.id}
                    >
                      {fmt(p.title)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top submenu (appears below when hovering a top parent) */}
              {shownTopParent && (
                <div
                  className="ud-children"
                  onMouseEnter={() => setHoverTopId(shownTopParent)}
                  onMouseLeave={() => setHoverTopId(null)}
                >
                  {(childrenByParent.get(shownTopParent) || []).map((c) => (
                    <a
                      key={c.id}
                      className="ud-child"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveMenuId(c.id);
                      }}
                      href="#"
                    >
                      <div className="font-semibold">{fmt(c.title)}</div>
                      {c.description && (
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {c.description}
                        </div>
                      )}
                    </a>
                  ))}
                  {!(childrenByParent.get(shownTopParent) || []).length && (
                    <div className="text-sm text-gray-500">
                      No sub-menus for this category.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* CONTENT */}
          {activeMenuId ? (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="ud-eyebrow">Content</div>
                <span className="ud-pill">Menu ID: {activeMenuId}</span>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const imgs = splitImages(item.image_path);
                  const grid =
                    imgs.length === 0 ? "grid-cols-1" : "md:grid-cols-4";
                  const textSpan =
                    imgs.length === 0
                      ? "col-span-1"
                      : imgs.length === 1
                      ? "md:col-span-3"
                      : "md:col-span-2";

                  return (
                    <Card key={item.id} className="ud-card">
                      <div
                        className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ borderColor: "var(--ud-border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            {fmt(item.subtitle)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Order: {fmt(item.order)}
                          </span>
                          <span className="ud-pill">{fmt(item.status)}</span>
                        </div>
                        <button
                          className="ud-expand-btn"
                          onClick={() => toggleRow(item.id)}
                        >
                          {expanded.has(item.id) ? "Collapse" : "Expand"}
                        </button>
                      </div>

                      {expanded.has(item.id) && (
                        <CardContent className="p-4">
                          <div className={`grid ${grid} gap-3 items-start`}>
                            <div
                              className={`${textSpan} text-sm whitespace-pre-wrap`}
                            >
                              {fmt(item.description)}
                            </div>
                            {imgs.length >= 1 && (
                              <div className="md:col-span-1 flex md:justify-end">
                                <span className="ud-img">
                                  <img
                                    src={imgs[0]}
                                    alt="image-1"
                                    onError={(e) => {
                                      e.currentTarget.closest(
                                        ".ud-img"
                                      ).style.display = "none";
                                    }}
                                  />
                                </span>
                              </div>
                            )}
                            {imgs.length >= 2 && (
                              <div className="md:col-span-1 flex md:justify-end">
                                <span className="ud-img">
                                  <img
                                    src={imgs[1]}
                                    alt="image-2"
                                    onError={(e) => {
                                      e.currentTarget.closest(
                                        ".ud-img"
                                      ).style.display = "none";
                                    }}
                                  />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            Published: {fmt(item.published_at)} · Created By:{" "}
                            {fmt(item.created_by)} · Updated By:{" "}
                            {fmt(item.updated_by)}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
                {!items.length && (
                  <div className="text-gray-500 text-sm">
                    No content in this category yet.
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="text-gray-600 text-sm">
              Pick a menu (top or left) to view its content.
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
