import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initCsrf,
  get_users,
  show_department,
  update_department,
} from "@/services/api.js";
import Loader from "@/lib/loading.jsx";

/* ---------- SimpleSelect ---------- */
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

export default function UpdateDepartment() {
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

    if (!form.name.trim()) return setErr("Name is required.");

    const payload = {
      name: form.name.trim(),
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      director_id:
        form.director_id && form.director_id !== "none"
          ? Number(form.director_id)
          : null,
    };

    try {
      setSaving(true);
      await initCsrf();
      const res = await update_department(id, payload);
      if (res?.status >= 200 && res?.status < 300) {
        navigate("/super_dashboard/department", { replace: true });
        return;
      }
      setErr(`Unexpected status ${res?.status} ${res?.statusText || ""}`);
    } catch (e) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      console.error("Department update failed:", status, body);
      setErr(
        status
          ? `${status} ${e.response.statusText || ""} — ${JSON.stringify(body)}`
          : `Network error — ${e?.message || "unknown"}`
      );
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
