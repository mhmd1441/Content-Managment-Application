import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initCsrf,
  getMenus,
  show_menu,
  update_menu,
} from "@/services/api.js";
import Loader from "../../../src/lib/loading.jsx";

function SimpleSelect({ id, value, onChange, options, placeholder = "Select..." }) {
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
  items.forEach(i => {
    if (i.parent_id && map.has(i.parent_id)) map.get(i.parent_id).children.push(map.get(i.id));
    else roots.push(map.get(i.id));
  });
  return { roots, map };
}
function flatten(roots) {
  const out = [];
  (function walk(nodes, depth = 0) {
    for (const n of nodes) {
      out.push({ id: n.id, title: n.title, depth });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  })(roots);
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

export default function UpdateMenuPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const myId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [allMenus, setAllMenus] = useState([]);

  const [form, setForm] = useState({
    title: "",
    route: "",
    order: "",
    status: "published",   // published | draft | archived
    parent_id: "none",
    position: "top",       // top | left
    publish_now: false,    // if true, force publish + set published_at now
  });

  const statusOptions = useMemo(() => ([
    { value: "published", label: "Published" },
    { value: "draft",     label: "Draft" },
    { value: "archived",  label: "Archived" },
  ]), []);

  const positionOptions = useMemo(() => ([
    { value: "top",  label: "Top" },
    { value: "left", label: "Left" },
  ]), []);

  // Build parent select options, excluding this menu and its descendants
  const parentOptions = useMemo(() => {
    const { roots, map } = buildTree(allMenus);
    const blocked = new Set([myId]);
    collectDescendants(map, myId, blocked);

    const flat = flatten(roots).filter(p => !blocked.has(p.id));
    const opts = [{ value: "none", label: "— No parent —" }].concat(
      flat.map(p => ({
        value: String(p.id),
        label: `${p.depth > 0 ? "— ".repeat(p.depth) : ""}${p.title ?? `#${p.id}`}`,
      }))
    );
    return opts;
  }, [allMenus, myId]);

  // Load menu + list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await initCsrf();

        const [menusRes, menuRes] = await Promise.all([
          getMenus(),
          show_menu(id),
        ]);

        const menus = Array.isArray(menusRes.data) ? menusRes.data : menusRes.data?.data || [];
        const mRaw  = menuRes?.data?.data || menuRes?.data || {};

        setAllMenus(menus);

        setForm({
          title:       mRaw.title ?? "",
          route:       mRaw.route ?? "",
          order:       String(mRaw.order ?? 0),
          status:      mRaw.status ?? "published",
          parent_id:   mRaw.parent_id == null ? "none" : String(mRaw.parent_id),
          position:    mRaw.position ?? "top",
          publish_now: false,   // explicit toggle; don't auto-publish on load
        });

        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Basic validation
    if (!form.title.trim()) return setErr("Title is required.");
    if (form.route && !form.route.startsWith("/")) return setErr("Route must start with '/' or be empty.");
    if (Number.isNaN(Number(form.order))) return setErr("Order must be a number.");

    try {
      setSaving(true);
      await initCsrf();

      const payload = {
        title: form.title.trim(),
        route: form.route.trim() || null,
        order: Number(form.order) || 0,
        status: form.status,
        parent_id: (form.parent_id && form.parent_id !== "none") ? Number(form.parent_id) : null,
        position: form.position,
      };

      if (form.publish_now) {
        payload.status = "published";
        payload.published_at = new Date().toISOString();
      }

      await update_menu(id, payload);
      navigate("/business_dashboard/menu");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to update menu.");
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
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Update Menu</h1>
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
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Dashboard"
            />
          </div>

          {/* Route */}
          <div className="space-y-2">
            <label htmlFor="route">Route</label>
            <input
              id="route"
              value={form.route}
              onChange={(e) => setForm(f => ({ ...f, route: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="/dashboard"
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
              placeholder="0"
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

          {/* Parent */}
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="parent">Parent</label>
            <SimpleSelect
              id="parent"
              value={form.parent_id}
              onChange={(v) => setForm(f => ({ ...f, parent_id: v }))}
              options={parentOptions}
              placeholder="Select parent…"
            />
          </div>

          {/* Position */}
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="position">Position</label>
            <SimpleSelect
              id="position"
              value={form.position}
              onChange={(v) => setForm(f => ({ ...f, position: v }))}
              options={positionOptions}
              placeholder="Select position…"
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
                setForm(f => ({
                  ...f,
                  publish_now: next,
                  status: next ? "published" : f.status,
                }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
                ${(form.publish_now || form.status === "published") ? "bg-green-500" : "bg-neutral-700"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition
                  ${(form.publish_now || form.status === "published") ? "translate-x-5" : "translate-x-1"}`}
              />
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
