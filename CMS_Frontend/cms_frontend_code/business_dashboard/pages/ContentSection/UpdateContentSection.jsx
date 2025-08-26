import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initCsrf,
  getMenus,
  get_contentSections,
  show_contentSection,
  update_contentSection,
} from "@/services/api.js";
import Loader from "@/lib/loading.jsx";

/* ---------- UI: SimpleSelect ---------- */
function SimpleSelect({ id, value, onChange, options, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const label = useMemo(
    () => options.find(o => String(o.value) === String(value))?.label ?? "",
    [options, value]
  );

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2 pr-10 text-left"
      >
        {label || <span className="text-neutral-400">{placeholder}</span>}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="currentColor">
            <path d="M5.5 7.5l4.5 5 4.5-5z" />
          </svg>
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute z-50 mt-2 w-full rounded-md border border-neutral-800 bg-black text-white shadow-xl max-h-64 overflow-auto"
          >
            {options.map((opt) => (
              <li key={String(opt.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={String(value) === String(opt.value)}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-neutral-800 ${
                    String(value) === String(opt.value) ? "bg-neutral-800" : ""
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function buildTree(items) {
  const map = new Map(items.map(i => [i.id, { ...i, children: [] }]));
  const roots = [];
  for (const i of items) {
    const node = map.get(i.id);
    if (i.parent_id && map.has(i.parent_id)) map.get(i.parent_id).children.push(node);
    else roots.push(node);
  }
  return { roots, map };
}
function flatten(nodes) {
  const out = [];
  (function walk(ns, depth = 0) {
    for (const n of ns) {
      out.push({ id: n.id, label: `${depth ? "— ".repeat(depth) : ""}${n.subtitle ?? `#${n.id}`}`, depth });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  })(nodes);
  return out;
}
function collectDescendants(map, id, acc = new Set()) {
  const node = map.get(id);
  if (!node) return acc;
  for (const c of node.children || []) {
    acc.add(c.id);
    collectDescendants(map, c.id, acc);
  }
  return acc;
}

export default function UpdateContentSectionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const myId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState([]);

  const [form, setForm] = useState({
    subtitle: "",
    description: "",
    image_path: "",
    order: "",
    status: "published",     
    expand_mode: "free",     
    menu_id: null,           
    parent_id: "none",     
    publish_now: false,      
  });

  const statusOptions = useMemo(() => ([
    { value: "published", label: "Published" },
    { value: "draft",     label: "Draft" },
    { value: "archived",  label: "Archived" },
  ]), []);

  const expandOptions = useMemo(() => ([
    { value: "free",      label: "Free" },
    { value: "expanded",  label: "Expanded" },
    { value: "collapsed", label: "Collapsed" },
  ]), []);

  const menuOptions = useMemo(
    () => menus.map(m => ({ value: m.id, label: m.title ?? m.name ?? `Menu #${m.id}` })),
    [menus]
  );

  const parentOptions = useMemo(() => {
    if (!form.menu_id) return [{ value: "none", label: "— No parent —" }];
    const scoped = sections.filter(s => Number(s.menu_id) === Number(form.menu_id));
    const { roots, map } = buildTree(scoped);
    const blocked = new Set([myId]);
    collectDescendants(map, myId, blocked);
    const flat = flatten(roots).filter(p => !blocked.has(p.id));
    return [{ value: "none", label: "— No parent —" }, ...flat.map(p => ({ value: p.id, label: p.label }))];
  }, [sections, form.menu_id, myId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await initCsrf();

        const [mRes, sRes, oneRes] = await Promise.all([
          getMenus(),
          get_contentSections(),
          show_contentSection(id),
        ]);

        const m = Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || [];
        const s = Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || [];
        const raw = oneRes?.data?.data || oneRes?.data || {};

        setMenus(m);
        setSections(s);

        setForm({
          subtitle:     raw.subtitle ?? "",
          description:  raw.description ?? "",
          image_path:   raw.image_path ?? "",
          order:        String(raw.order ?? 0),
          status:       raw.status ?? "published",
          expand_mode:  raw.expand_mode ?? "free",
          menu_id:      raw.menu_id ?? (m[0]?.id ?? null),
          parent_id:    raw.parent_id == null ? "none" : String(raw.parent_id),
          publish_now:  false,
        });

        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load content section.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErr("");

  if (!form.menu_id) return setErr("Menu is required.");
  if (!form.subtitle.trim()) return setErr("Subtitle is required.");
  if (Number.isNaN(Number(form.order))) return setErr("Order must be a number.");

  const payload = {
    subtitle: form.subtitle.trim(),
    description: form.description.trim() || null,
    image_path: form.image_path.trim() || null,
    order: Number(form.order) || 0,
    status: form.status,
    expand_mode: form.expand_mode,
    menu_id: Number(form.menu_id),
    parent_id: form.parent_id && form.parent_id !== "none" ? Number(form.parent_id) : null,
  };
  if (form.publish_now) {
    payload.status = "published";
    payload.published_at = new Date().toISOString();
  }

  try {
    setSaving(true);
    await initCsrf();
    console.log("POST /api/update_contentSection/", id, payload);
    const res = await update_contentSection(id, payload);
    if (res?.status >= 200 && res?.status < 300) {
      navigate("/business_dashboard/content", { replace: true });
      return;
    }
    setErr(`Unexpected status ${res?.status} ${res?.statusText || ""}`);
  } catch (e) {
    const status = e?.response?.status;
    const body = e?.response?.data;
    console.error("ContentSection update failed:", status, body);
    setErr(status ? `${status} ${e.response.statusText || ""} — ${JSON.stringify(body)}`
                  : `Network error — ${e?.message || "unknown"}`);
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" aria-busy="true">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Update Content Section</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-md border border-neutral-800 bg-black hover:bg-neutral-900"
        >
          Back
        </button>
      </div>
      <p className="text-neutral-400">Edit the fields you want to update.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. E-Sim"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="Write a short description…"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="image_path">Image path / URL</label>
            <input
              id="image_path"
              value={form.image_path}
              onChange={(e) => setForm(f => ({ ...f, image_path: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="https://… or img/banner.png"
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <label htmlFor="order">Order</label>
            <input
              id="order"
              type="number"
              inputMode="numeric"
              value={form.order}
              onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status">Status</label>
            <SimpleSelect
              id="status"
              value={form.status}
              onChange={(v) => setForm(f => ({ ...f, status: v }))}
              options={statusOptions}
              placeholder="Select status…"
            />
          </div>

          {/* Expand mode */}
          <div className="space-y-2">
            <label htmlFor="expand_mode">Expand mode</label>
            <SimpleSelect
              id="expand_mode"
              value={form.expand_mode}
              onChange={(v) => setForm(f => ({ ...f, expand_mode: v }))}
              options={expandOptions}
              placeholder="Select expand mode…"
            />
          </div>

          {/* Menu */}
          <div className="space-y-2">
            <label htmlFor="menu">Menu</label>
            <SimpleSelect
              id="menu"
              value={form.menu_id ?? ""}
              onChange={(v) => setForm(f => ({ ...f, menu_id: v, parent_id: "none" }))}
              options={menuOptions}
              placeholder="Select menu…"
            />
          </div>

          {/* Parent (scoped to menu, cycle-safe) */}
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="parent">Parent section</label>
            <SimpleSelect
              id="parent"
              value={form.parent_id}
              onChange={(v) => setForm(f => ({ ...f, parent_id: v }))}
              options={parentOptions}
              placeholder="— No parent —"
            />
          </div>

          <div className="flex items-center justify-between sm:col-span-2 rounded-md border border-neutral-800 bg-black px-3 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.publish_now || form.status === "published"}
              aria-label="Publish now"
              onClick={() => {
                const next = !(form.publish_now || form.status === "published");
                setForm(f => ({ ...f, publish_now: next, status: next ? "published" : f.status }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
                ${(form.publish_now || form.status === "published") ? "bg-green-500" : "bg-neutral-700"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition
                ${(form.publish_now || form.status === "published") ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {err ? <p className="text-sm text-red-400">{err}</p> : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-3 py-2 rounded-md border border-neutral-800 bg-black hover:bg-neutral-900 disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
