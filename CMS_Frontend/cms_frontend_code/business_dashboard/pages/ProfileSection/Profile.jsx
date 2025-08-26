import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/lib/loading.jsx";
import { initCsrf, me, update_user } from "@/services/api";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const nonEmpty = (v) => (v ?? "").trim().length > 0;

export default function Profile() {
  const { user: authUser } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await initCsrf();
        const res = await me();
        const u = res?.data?.data || res?.data || {};
        if (!ignore) {
          setForm((f) => ({
            ...f,
            id: u.id ?? authUser?.id ?? null,
            first_name: u.first_name ?? authUser?.first_name ?? "",
            last_name: u.last_name ?? authUser?.last_name ?? "",
            email: u.email ?? authUser?.email ?? "",
          }));
        }
      } catch (e) {
        if (!ignore) setErr("Failed to load profile.");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [authUser?.id]);

  const v = useMemo(() => {
    const errors = {};
    if (!nonEmpty(form.first_name)) errors.first_name = "Required";
    if (!nonEmpty(form.last_name)) errors.last_name = "Required";
    if (!emailOk(form.email)) errors.email = "Invalid email";
    const wantsPwChange =
      form.new_password ||
      form.new_password_confirmation ||
      form.current_password;
    if (wantsPwChange) {
      if (!nonEmpty(form.current_password))
        errors.current_password = "Current password required";
      if ((form.new_password || "").length < 8)
        errors.new_password = "Min 8 characters";
      if (form.new_password !== form.new_password_confirmation)
        errors.new_password_confirmation = "Passwords do not match";
    }
    return { errors, valid: Object.keys(errors).length === 0, wantsPwChange };
  }, [form]);

  const onChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setOk("");
    setErr(null);
  };

  async function onSave() {
    if (!v.valid) return;
    try {
      setSaving(true);
      setOk("");
      setErr(null);
      await initCsrf();
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      };
      if (v.wantsPwChange) {
        payload.current_password = form.current_password;
        payload.password = form.new_password;
        payload.password_confirmation = form.new_password_confirmation;
      }
      const id = form.id ?? authUser?.id;
      if (!id) throw new Error("Missing user id.");
      await update_user(id, payload);
      setOk(
        v.wantsPwChange ? "Profile & password updated." : "Profile updated."
      );
      setForm((f) => ({
        ...f,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      }));
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.current_password?.[0] ||
        e?.response?.data?.errors?.email?.[0] ||
        "Update failed. Check your inputs and try again.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" aria-busy="true">
        <Loader message="Loading your profile…" />
      </div>
    );
  }

  return (
    <div className="bd-container space-y-6">
      <div className="bd-hero">
        <div className="bd-eyebrow">Profile</div>
        <h1 className="bd-title">Edit Profile</h1>
      </div>

      <div className="flex items-center">
        <div
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-neutral-800 text-lg font-semibold text-neutral-200"
          aria-hidden="true"
        >
          {String(form.first_name || "?")[0]?.toUpperCase()}
          {String(form.last_name || "")[0]?.toUpperCase()}
        </div>

        <div className="ml-4 text-neutral-400">
          Signed in as{" "}
          <span className="text-neutral-200">{form.email || "—"}</span>
        </div>
      </div>

      {err && (
        <div
          role="alert"
          className="rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-red-200"
        >
          {err}
        </div>
      )}
      {ok && (
        <div
          role="status"
          className="rounded-md border border-emerald-800 bg-emerald-950/60 px-3 py-2 text-emerald-200"
        >
          {ok}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">
            First name
          </label>
          <Input
            value={form.first_name}
            onChange={onChange("first_name")}
            placeholder="First name"
          />
          {v.errors.first_name && (
            <div className="mt-1 text-xs text-red-400">
              {v.errors.first_name}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">
            Last name
          </label>
          <Input
            value={form.last_name}
            onChange={onChange("last_name")}
            placeholder="Last name"
          />
          {v.errors.last_name && (
            <div className="mt-1 text-xs text-red-400">
              {v.errors.last_name}
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-neutral-400 mb-1">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="name@company.com"
          />
          {v.errors.email && (
            <div className="mt-1 text-xs text-red-400">{v.errors.email}</div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-neutral-400">
          Change password (optional)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-neutral-400 mb-1">
              Current password
            </label>
            <Input
              type="password"
              value={form.current_password}
              onChange={onChange("current_password")}
              placeholder="••••••••"
            />
            {v.errors.current_password && (
              <div className="mt-1 text-xs text-red-400">
                {v.errors.current_password}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              New password
            </label>
            <Input
              type="password"
              value={form.new_password}
              onChange={onChange("new_password")}
              placeholder="At least 8 characters"
            />
            {v.errors.new_password && (
              <div className="mt-1 text-xs text-red-400">
                {v.errors.new_password}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Confirm new password
            </label>
            <Input
              type="password"
              value={form.new_password_confirmation}
              onChange={onChange("new_password_confirmation")}
              placeholder="Repeat new password"
            />
            {v.errors.new_password_confirmation && (
              <div className="mt-1 text-xs text-red-400">
                {v.errors.new_password_confirmation}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSave}
          disabled={saving || !v.valid}
          className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-neutral-300"
          onClick={() =>
            setForm((f) => ({
              ...f,
              first_name: f.first_name,
              last_name: f.last_name,
              email: f.email,
              current_password: "",
              new_password: "",
              new_password_confirmation: "",
            }))
          }
        >
          Clear password fields
        </Button>
      </div>
    </div>
  );
}
