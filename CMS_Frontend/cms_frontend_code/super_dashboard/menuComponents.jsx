import { useEffect, useRef, useState } from "react";
import { initCsrf, getMenus } from "../src/services/api";

function buildTree(items) {
  const byId = new Map(items.map(i => [i.id, { ...i, children: [] }]));
  const roots = [];
  items.forEach(i => {
    const node = byId.get(i.id);
    if (i.parent_id && byId.has(i.parent_id)) {
      byId.get(i.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function flattenTree(nodes, depth = 0, out = []) {
  nodes.forEach(n => {
    out.push({ ...n, depth });
    if (n.children?.length) flattenTree(n.children, depth + 1, out);
  });
  return out;
}

export default function MenuList() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didFetch = useRef(false);
  const rows = flattenTree(menus);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
      try {
        await initCsrf();
        const res = await getMenus();
        const flat = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMenus(buildTree(flat));
      } catch (err) {
        console.error("Menu fetch error:", err);
        setError("Failed to load menus.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading menus…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th align="left">Title</th>
        <th align="left">Route</th>
        <th align="left">Order</th>
        <th align="left">Status</th>
        <th align="left">Parent ID</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(r => (
        <tr key={r.id}>
          <td style={{ paddingLeft: r.depth * 16 }}>{r.title}</td>
          <td>{r.route || "—"}</td>
          <td>{r.order ?? "—"}</td>
          <td>{r.status || "—"}</td>
          <td>{r.parent_id ?? "—"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
}
