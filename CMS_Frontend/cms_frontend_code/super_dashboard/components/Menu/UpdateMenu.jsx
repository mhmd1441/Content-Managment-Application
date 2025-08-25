import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initCsrf,
  get_users,
  show_department,
  update_menu,
} from "@/services/api.js";
import Loader from "@/lib/loading.jsx";

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

/* ---------- Page ---------- */
export default function UpdateDepartmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    director_id: "none",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await initCsrf();

        const [usersRes, depRes] = await Promise.all([
          get_users(),
          show_department(id),
        ]);

        const uList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
        const raw   = depRes?.data?.data || depRes?.data || {};

        setUsers(uList);

        setForm({
          name: raw.name ?? "",
          country: raw.country ?? "",
          city: raw.city ?? "",
          director_id: raw.director_id == null ? "none" : String(raw.director_id),
        });

        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load department.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const directorOptions = useMemo(
    () => [
      { value: "none", label: "— No director —" },
      ...users.map(u => ({
        value: String(u.id),
        label:
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
          u.email ||
          `#${u.id}`,
      })),
    ],
    [users]
  );

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErr("");

  if (!form.title.trim()) return setErr("Title is required.");
  if (form.route && !form.route.startsWith("/")) return setErr("Route must start with '/' or be empty.");
  if (Number.isNaN(Number(form.order))) return setErr("Order must be a number.");

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

  try {
    setSaving(true);
    await initCsrf();
    const payload = {
        title: form.title.trim(),
        route:  form.route.trim(),
        order:      form.order.trim(),
        status: form.status.trim(),
        position:    form.job_title.trim(),
        publish_now: form.publish_now,
        parent_id: form.menu_id && form.menu_id !== "none" ? Number(form.menu_id) : null,
      };
      await update_menu(id, payload);
      navigate("/super_dashboard/menu");
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
        <h1 className="text-xl font-semibold">Update Department</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-md border border-neutral-800 bg-black hover:bg-neutral-900"
        >
          Back
        </button>
      </div>
      <p className="text-neutral-400">Edit department details and (optionally) assign a director.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Information Technology"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              value={form.country}
              onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Lebanon"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city">City</label>
            <input
              id="city"
              value={form.city}
              onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Beirut"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="director">Director</label>
            <SimpleSelect
              id="director"
              value={form.director_id}
              onChange={(v) => setForm(f => ({ ...f, director_id: v }))}
              options={directorOptions}
              placeholder="Select director…"
            />
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
