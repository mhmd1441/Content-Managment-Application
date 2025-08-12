import { useEffect, useState } from "react";
import { initCsrf, api, getMenus } from "@/services/api";

export default function AddMenu() {
  const [form, setForm] = useState({
    title: "",
    route: "",
    order: 1,
    status: "draft",
    published_at: "",
    parent_id: "",
  });
  const [menus, setMenus] = useState([]);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMenus();
        setMenus(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      await initCsrf();
      const payload = {
        title: form.title.trim(),
        route: form.route.trim(),
        order: Number(form.order) || 0,
        status: form.status,
        published_at: form.published_at,
        parent_id: form.parent_id || null,
      };
      const { data } = await api.post("/api/menus", payload);
      setMsg(data?.message || "Menu created successfully.");
      setForm({
        title: "",
        route: "",
        order: 1,
        status: "draft",
        published_at: "",
        parent_id: "",
      });
    } catch (e2) {
      const v = e2?.response?.data;
      setErr(v?.errors || v?.message || "Failed to create menu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "20px auto" }}>
      <h2 style={{ marginBottom: 10 }}>Add Menu</h2>
      {msg && (
        <div
          style={{
            padding: 8,
            background: "#ecfdf5",
            border: "1px solid #10b981",
            marginBottom: 10,
          }}
        >
          {String(msg)}
        </div>
      )}
      {err && (
        <div
          style={{
            padding: 8,
            background: "#fef2f2",
            border: "1px solid #ef4444",
            marginBottom: 10,
          }}
        >
          {typeof err === "object" ? JSON.stringify(err) : String(err)}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label>
          Title
          <br />
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />

        <label>
          Route (e.g. /plans)
          <br />
          <input
            name="route"
            value={form.route}
            onChange={onChange}
            required
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />

        <label>
          Order
          <br />
          <input
            type="number"
            name="order"
            value={form.order}
            onChange={onChange}
            required
            min={0}
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />

        <label>
          Status
          <br />
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            required
            style={{ width: "100%" }}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <br />
        <br />

        <label>
          Published At
          <br />
          <input
            type="date"
            name="published_at"
            value={form.published_at}
            onChange={onChange}
            required
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />

        <label>
          Parent Menu (optional)
          <br />
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={onChange}
            style={{ width: "100%" }}
          >
            <option value="">— None —</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} (#{m.id})
              </option>
            ))}
          </select>
        </label>
        <br />
        <br />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        >
          {loading ? "Saving..." : "Create Menu"}
        </button>
      </form>
    </div>
  );
}
