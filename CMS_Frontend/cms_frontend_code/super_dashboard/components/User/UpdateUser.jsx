import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initCsrf,
  show_user,
  update_user,
  get_departments,
  get_users,
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

export default function UpdateUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",             
    phone_number: "",
    job_title: "",
    role: "business_user",
    status: "active",
    department_id: "none",
    supervisor_id: "none",
    email_verified_now: false,
  });

  // Options
  const roleOptions = useMemo(() => ([
    { value: "super_admin",    label: "Super Admin" },
    { value: "business_admin", label: "Business Admin" },
    { value: "business_user",  label: "Business User" },
  ]), []);

  const statusOptions = useMemo(() => ([
    { value: "active",   label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended",label: "Suspended" },
  ]), []);

  const departmentOptions = useMemo(
    () => [{ value: "none", label: "— No department —" }].concat(
      departments.map(d => ({ value: d.id, label: d.name ?? `#${d.id}` }))
    ),
    [departments]
  );

  const supervisorOptions = useMemo(
    () => [{ value: "none", label: "— No supervisor —" }].concat(
      supervisors.map(u => ({
        value: u.id,
        label: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email || `#${u.id}`,
      }))
    ),
    [supervisors]
  );

  // Load user + lists
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await initCsrf();

        const [depRes, supRes, userRes] = await Promise.all([
          get_departments(),
          get_users(),        // for supervisor list
          show_user(id),
        ]);

        const deps = Array.isArray(depRes.data) ? depRes.data : depRes.data?.data || [];
        const sups = Array.isArray(supRes.data) ? supRes.data : supRes.data?.data || [];
        const uRaw = userRes?.data?.data || userRes?.data || {};

        setDepartments(deps);
        setSupervisors(sups);

        // Pre-fill form
        setForm({
          first_name: uRaw.first_name ?? "",
          last_name:  uRaw.last_name ?? "",
          email:      uRaw.email ?? "",
          password:   "", // keep blank: only send if changed
          phone_number: uRaw.phone_number ?? "",
          job_title:    uRaw.job_title ?? "",
          role: (uRaw.role ?? "business_user"),
          status: (uRaw.status ?? "active"),
          department_id: (uRaw.department_id ?? "none") || "none",
          supervisor_id: (uRaw.supervisor_id ?? "none") || "none",
          email_verified_now: false, // toggle if you want to set now
        });

        setErr("");
      } catch (e) {
        console.error(e);
        setErr("Failed to load user.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.first_name.trim()) return setErr("First name is required.");
    if (!form.last_name.trim())  return setErr("Last name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr("Valid email is required.");
    if (form.password && form.password.length < 8) return setErr("Password must be at least 8 characters.");

    try {
      setSaving(true);
      await initCsrf();

      const payload = {
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        phone_number: form.phone_number.trim() || null,
        job_title:    form.job_title.trim() || null,
        role: form.role,
        status: form.status,
        department_id: form.department_id && form.department_id !== "none" ? Number(form.department_id) : null,
        supervisor_id: form.supervisor_id && form.supervisor_id !== "none" ? Number(form.supervisor_id) : null,
      };

      if (form.password) {
        payload.password = form.password;
      }
      if (form.email_verified_now) {
        payload.email_verified_at = new Date().toISOString();
      }

      await update_user(id, payload);
      navigate("/super_dashboard/user");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to update user.");
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
        <h1 className="text-xl font-semibold">Update User</h1>
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
          {/* Names */}
          <div className="space-y-2">
            <label htmlFor="first_name">First name</label>
            <input
              id="first_name"
              value={form.first_name}
              onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Mohamad"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              value={form.last_name}
              onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Moumneh"
            />
          </div>

          {/* Email / Password */}
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="Leave blank to keep current"
            />
          </div>

          {/* Phone / Job title */}
          <div className="space-y-2">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              inputMode="tel"
              value={form.phone_number}
              onChange={(e) => setForm(f => ({ ...f, phone_number: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. 70740676"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="job_title">Job title</label>
            <input
              id="job_title"
              value={form.job_title}
              onChange={(e) => setForm(f => ({ ...f, job_title: e.target.value }))}
              className="w-full rounded-md border border-neutral-800 bg-black text-white px-3 py-2"
              placeholder="e.g. Admin"
            />
          </div>

          {/* Role / Status */}
          <div className="space-y-2">
            <label htmlFor="role">Role</label>
            <SimpleSelect
              id="role"
              value={form.role}
              onChange={(v) => setForm(f => ({ ...f, role: v }))}
              options={roleOptions}
              placeholder="Select role…"
            />
          </div>
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

          {/* Department / Supervisor */}
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="department">Department</label>
            <SimpleSelect
              id="department"
              value={form.department_id ?? "none"}
              onChange={(v) => setForm(f => ({ ...f, department_id: v }))}
              options={departmentOptions}
              placeholder="Select department…"
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="supervisor">Supervisor</label>
            <SimpleSelect
              id="supervisor"
              value={form.supervisor_id ?? "none"}
              onChange={(v) => setForm(f => ({ ...f, supervisor_id: v }))}
              options={supervisorOptions}
              placeholder="Select supervisor…"
            />
          </div>

          {/* Email verified now */}
          <div className="flex items-center justify-between sm:col-span-2 rounded-md border border-neutral-800 bg-black px-3 py-2">
            <div>
              <label className="font-medium">Mark email as verified</label>
              <p className="text-xs text-neutral-400">
                Sets <code className="text-neutral-300">email_verified_at</code> to now.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.email_verified_now}
              aria-label="Email verified now"
              onClick={() => setForm(f => ({ ...f, email_verified_now: !f.email_verified_now }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
                ${form.email_verified_now ? "bg-green-500" : "bg-neutral-700"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${form.email_verified_now ? "translate-x-5" : "translate-x-1"}`} />
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
