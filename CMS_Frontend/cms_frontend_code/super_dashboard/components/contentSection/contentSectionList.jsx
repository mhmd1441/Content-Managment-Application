import { useEffect, useMemo, useRef, useState } from "react";
import {
  initCsrf,
  get_contentSections,
  delete_contentSection,
  get_total_contentSection,
  get_new_contentSection,
} from "@/services/api.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/lib/loading.jsx";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Plus,
  Search,
} from "lucide-react";

const fmt = (v) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

function buildTree(items) {
  const map = new Map(items.map((i) => [i.id, { ...i, children: [] }]));
  const roots = [];
  for (const i of items) {
    const node = map.get(i.id);
    if (i.parent_id && map.has(i.parent_id))
      map.get(i.parent_id).children.push(node);
    else roots.push(node);
  }
  return roots;
}
function flattenTree(nodes, depth = 0, out = []) {
  for (const n of nodes) {
    out.push({ ...n, depth });
    if (n.children?.length) flattenTree(n.children, depth + 1, out);
  }
  return out;
}

export default function ContentSectionList() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalContentSections, setTotalContentSections] = useState(0);
  const [newSectionsThisMonth, setNewSectionsThisMonth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const [listRes, totalRes, newRes] = await Promise.all([
          get_contentSections(),
          get_total_contentSection(),
          get_new_contentSection(),
        ]);

        const flat = Array.isArray(listRes.data)
          ? listRes.data
          : listRes.data?.data || [];
        setTree(buildTree(flat));

        setTotalContentSections(
          typeof totalRes.data === "number"
            ? totalRes.data
            : totalRes.data?.total ??
                totalRes.data?.total_content_sections ??
                flat.length
        );

        setNewSectionsThisMonth(
          typeof newRes.data === "number"
            ? newRes.data
            : newRes.data?.count ?? newRes.data?.new_content_sections ?? 0
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load Content Sections");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    let r = flattenTree(tree);
    if (q.trim()) {
      const needle = q.toLowerCase();
      r = r.filter(
        (x) =>
          x.subtitle?.toLowerCase?.().includes(needle) ||
          x.description?.toLowerCase?.().includes(needle) ||
          x.route?.toLowerCase?.().includes(needle) ||
          String(x.id).includes(needle)
      );
    }
    if (status !== "all")
      r = r.filter((x) => (x.status || "").toLowerCase() === status);
    if (parentFilter !== "all") {
      const pf = parentFilter.toLowerCase();
      r = r.filter((x) =>
        String(x.parent_id ?? "")
          .toLowerCase()
          .includes(pf)
      );
    }
    return r;
  }, [tree, q, status, parentFilter]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = rows.slice((page - 1) * pageSize, page * pageSize);

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(current.map((r) => r.id)));
    else setSelected(new Set());
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" aria-busy="true">
        <Loader />
      </div>
    );
  }
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  const handleUpdate = (id) => {
    if (!id) return;
    navigate(`/super_dashboard/content_section/edit/${id}`);
  };

  const load = async () => {
    setLoading(true);
    try {
      await initCsrf();
      const [listRes, totalRes, newRes] = await Promise.all([
        get_contentSections(),
        get_total_contentSection(),
        get_new_contentSection(),
      ]);

      const arr = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data?.data || [];
      setTree(buildTree(arr));

      setTotalContentSections(
        typeof totalRes.data === "number"
          ? totalRes.data
          : totalRes.data?.total ??
              totalRes.data?.total_content_sections ??
              arr.length
      );

      setNewSectionsThisMonth(
        typeof newRes.data === "number"
          ? newRes.data
          : newRes.data?.count ?? newRes.data?.new_content_sections ?? 0
      );

      setErr(null);
    } catch (e) {
      console.error(e);
      setErr("Failed to load Content Sections");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return alert("Missing content section id.");
    if (!window.confirm("Delete this content section?")) return;
    try {
      await initCsrf();
      await delete_contentSection(id);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">


      <div className="grid grid-cols-2 gap-4">
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 ring-1 ring-white/10"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 50px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
            <div className="absolute -bottom-24 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="text-[0.95rem] text-neutral-300">
            Total content sections
          </div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {totalContentSections?.toLocaleString?.() ?? totalContentSections}
          </div>
        </div>



        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 ring-1 ring-white/10"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 50px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
            <div className="absolute -bottom-24 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="text-[0.95rem] text-neutral-300">New this month</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {newSectionsThisMonth?.toLocaleString?.() ?? newSectionsThisMonth}
          </div>
        </div>
      </div>



      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search Content Sections..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-8 bg-neutral-900/60 border-neutral-800"
            />
          </div>

          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-neutral-900/60 border-neutral-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={parentFilter}
            onValueChange={(v) => {
              setParentFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] bg-neutral-900/60 border-neutral-800">
              <SelectValue placeholder="Filter by parent" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All parents</SelectItem>
              <SelectItem value="1">Parent ID includes “1”</SelectItem>
              <SelectItem value="projects">
                Parent includes “projects”
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/super_dashboard/content_section/create")}
            className="bg-neutral-800 hover:bg-neutral-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Content Section
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    current.length > 0 && selected.size === current.length
                  }
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Image Path</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Expandable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead>Parent ID</TableHead>
              <TableHead>Menu ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {current.map((r) => (
              <TableRow key={r.id} className="border-neutral-900">
                <TableCell>
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={() => toggleOne(r.id)}
                    aria-label={`Select row ${r.id}`}
                  />
                </TableCell>
                <TableCell className="text-neutral-300">{fmt(r.id)}</TableCell>
                <TableCell className="text-neutral-200">
                  <span style={{ paddingLeft: (r.depth || 0) * 16 }}>
                    {fmt(r.subtitle)}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.description)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.image_path)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.order)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.is_expandable)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      "inline-flex items-center rounded px-2 py-0.5 text-xs " +
                      (r.status === "published"
                        ? "bg-emerald-900/30 text-emerald-300"
                        : r.status === "draft"
                        ? "bg-neutral-800 text-neutral-300"
                        : "bg-amber-900/30 text-amber-300")
                    }
                  >
                    {fmt(r.status)}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.created_by)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.updated_by)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.published_at)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.parent_id)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.menu_id)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.created_at)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.updated_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-neutral-800 hover:bg-neutral-700"
                      onClick={() => handleUpdate(r.id)}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {current.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={16}
                  className="text-center py-10 text-neutral-500"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-800">
          <div className="text-sm text-neutral-400">
            {selected.size} of {rows.length} rows selected
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] bg-neutral-900/60 border-neutral-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-neutral-400">
              Page {page} of {pageCount}
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 3))}
                disabled={page <= 1}
                title="Fast backward"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(pageCount, p + 3))}
                disabled={page >= pageCount}
                title="Fast forward"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
