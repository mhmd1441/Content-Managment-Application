import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initCsrf, save_menu, getMenus } from "@/services/api.js";

function buildFlat(items) {
  const map = new Map();
  items.forEach(i => map.set(i.id, { ...i, children: [] }));
  const roots = [];
  items.forEach(i => {
    if (i.parent_id && map.has(i.parent_id)) map.get(i.parent_id).children.push(map.get(i.id));
    else roots.push(map.get(i.id));
  });
  const out = [];
  (function walk(nodes, depth = 0) {
    for (const n of nodes) {
      out.push({ id: n.id, title: n.title, depth });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  })(roots);
  return out;
}

export default function CreateMenuPage() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    route: "",
    order: "",
    status: "published",
    parent_id: null,
    position: "top",
    publish_now: true,
  });

  useEffect(() => {
    (async () => {
      try {
        await initCsrf(); // set cookie once
        const res = await getMenus();
        const flat = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setParents(buildFlat(flat));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const parentOptions = useMemo(
    () =>
      parents.map(p => ({
        id: p.id,
        label: `${(p.depth ?? 0) > 0 ? "— ".repeat(p.depth) : ""}${p.title ?? `#${p.id}`}`,
      })),
    [parents]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Title is required.");
    if (form.route && !form.route.startsWith("/")) return setErr("Route must start with '/'.");

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        route: form.route.trim() || null,
        order: Number(form.order) || 0,
        status: form.publish_now ? "published" : form.status,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        position: form.position,
        published_at: form.publish_now ? new Date().toISOString() : null,
      };
      await save_menu(payload);
      navigate("/super_dashboard/menu");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to create menu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Menu</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-md border border-neutral-800 bg-black hover:bg-neutral-900"
        >
          Back
        </button>
      </div>
      <p className="text-neutral-400">Fill the details and choose where it appears.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              placeholder="e.g. Dashboard"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
            />
          </div>

          {/* Route */}
          <div className="space-y-2">
            <label htmlFor="route">Route</label>
            <input
              id="route"
              placeholder="/dashboard"
              value={form.route}
              onChange={(e) => setForm(f => ({ ...f, route: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
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

          {/* Status (native) */}
          <div className="space-y-2">
            <label htmlFor="status">Status</label>
            <div className="relative">
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-md border border-neutral-800 bg-black text-white
                           px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-0"
              >
                <option value="published" style={{ backgroundColor: "#000", color: "#fff" }}>
                  Published
                </option>
                <option value="draft" style={{ backgroundColor: "#000", color: "#fff" }}>
                  Draft
                </option>
                <option value="archived" style={{ backgroundColor: "#000", color: "#fff" }}>
                  Archived
                </option>
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="currentColor">
                  <path d="M5.5 7.5l4.5 5 4.5-5z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="parent">Parent</label>
            <div className="relative">
              <select
                id="parent"
                value={form.parent_id == null ? "none" : String(form.parent_id)}
                onChange={(e) =>
                  setForm(f => ({
                    ...f,
                    parent_id: e.target.value === "none" ? null : Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-neutral-800 bg-black text-white
                           px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-0"
              >
                <option value="none" style={{ backgroundColor: "#000", color: "#fff" }}>
                  — No parent —
                </option>
                {parentOptions.map((p) => (
                  <option
                    key={p.id}
                    value={String(p.id)}
                    style={{ backgroundColor: "#000", color: "#fff" }}
                  >
                    {p.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="currentColor">
                  <path d="M5.5 7.5l4.5 5 4.5-5z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="position">Position</label>
            <div className="relative">
              <select
                id="position"
                value={form.position}
                onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full rounded-md border border-neutral-800 bg-black text-white
                           px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-0"
              >
                <option value="top" style={{ backgroundColor: "#000", color: "#fff" }}>Top</option>
                <option value="left" style={{ backgroundColor: "#000", color: "#fff" }}>Left</option>
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="currentColor">
                  <path d="M5.5 7.5l4.5 5 4.5-5z" />
                </svg>
              </span>
            </div>
          </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.publish_now || form.status === "published"}
              aria-label="Publish now"
              tabIndex={0}
              onClick={() => {
                const next = !(form.publish_now || form.status === "published");
                setForm(f => ({
                  ...f,
                  publish_now: next,
                  status: next ? "published" : f.status,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const next = !(form.publish_now || form.status === "published");
                  setForm(f => ({
                    ...f,
                    publish_now: next,
                    status: next ? "published" : f.status,
                  }));
                }
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
            {saving ? "Saving…" : "Create"}
           </button>
        </div>
      </form>
    </div>
  );
}