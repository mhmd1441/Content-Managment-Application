import { useEffect, useState } from "react";
import { initCsrf, api, getMenus, get_contentSections } from "@/services/api";

export default function AddContentSection() {
  const [form, setForm] = useState({
    subtitle: "",
    description: "",
    image_path: "",
    order: 1,
    expand_mode: "collapsed", // NEW
    status: "draft",
    published_at: "",
    parent_id: "",
    menu_id: "",
  });

  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState([]);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, sRes] = await Promise.all([getMenus(), get_contentSections()]);
        setMenus(Array.isArray(mRes?.data?.data) ? mRes.data.data : []);
        setSections(Array.isArray(sRes?.data?.data) ? sRes.data.data : []);
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
        subtitle: form.subtitle.trim(),
        description: form.description.trim() || null,
        image_path: form.image_path.trim() || null,
        order: Number(form.order) || 0,
        expand_mode: form.expand_mode, // NEW
        status: form.status,
        published_at: form.published_at || null,
        parent_id: form.parent_id || null,
        menu_id: form.menu_id, // required
      };
      const { data } = await api.post("/api/content-sections", payload);
      setMsg(data?.message || "Content section created successfully.");
      setForm({
        subtitle: "",
        description: "",
        image_path: "",
        order: 1,
        expand_mode: "collapsed",
        status: "draft",
        published_at: "",
        parent_id: "",
        menu_id: "",
      });
    } catch (e2) {
      const v = e2?.response?.data;
      setErr(v?.errors || v?.message || "Failed to create content section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "20px auto" }}>
      <h2 style={{ marginBottom: 10 }}>Add Content Section</h2>

      {msg && (
        <div style={{ padding: 8, background: "#ecfdf5", border: "1px solid #10b981", marginBottom: 10 }}>
          {String(msg)}
        </div>
      )}
      {err && (
        <div style={{ padding: 8, background: "#fef2f2", border: "1px solid #ef4444", marginBottom: 10 }}>
          {typeof err === "object" ? JSON.stringify(err) : String(err)}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label>Subtitle<br />
          <input name="subtitle" value={form.subtitle} onChange={onChange} required style={{ width: "100%" }} />
        </label><br /><br />

        <label>Description<br />
          <textarea name="description" value={form.description} onChange={onChange} rows={4} style={{ width: "100%" }} />
        </label><br /><br />

        <label>Image Path (URL or storage path)<br />
          <input name="image_path" value={form.image_path} onChange={onChange} style={{ width: "100%" }} />
        </label><br /><br />

        <label>Order<br />
          <input type="number" name="order" value={form.order} onChange={onChange} required min={0} style={{ width: "100%" }} />
        </label><br /><br />

        <label>Expand Mode<br />
          <select name="expand_mode" value={form.expand_mode} onChange={onChange} required style={{ width: "100%" }}>
            <option value="collapsed">collapsed</option>
            <option value="expanded">expanded</option>
            <option value="free">free (show nothing)</option>
          </select>
        </label><br /><br />

        <label>Status<br />
          <select name="status" value={form.status} onChange={onChange} required style={{ width: "100%" }}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label><br /><br />

        <label>Published At<br />
          <input type="date" name="published_at" value={form.published_at} onChange={onChange} style={{ width: "100%" }} />
        </label><br /><br />

        <label>Menu (required)<br />
          <select name="menu_id" value={form.menu_id} onChange={onChange} required style={{ width: "100%" }}>
            <option value="">— Select menu —</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>{m.title} (#{m.id})</option>
            ))}
          </select>
        </label><br /><br />

        <label>Parent Content Section (optional)<br />
          <select name="parent_id" value={form.parent_id} onChange={onChange} style={{ width: "100%" }}>
            <option value="">— None —</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.subtitle} (#{s.id})</option>
            ))}
          </select>
        </label><br /><br />

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Saving..." : "Create Content Section"}
        </button>
      </form>
    </div>
  );
}
