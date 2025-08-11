import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, getMenus } from "../../src/services/api";
import Loader from "../../src/lib/loading.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const menuStats = [
  {
    title: "Total Menus",
    value: "120",
    interval: "All time",
    trend: "neutral",
    data: [
      10, 12, 13, 12, 14, 16, 15, 17, 18, 17, 19, 20, 19, 21, 22, 22, 23, 22,
      22, 23, 24, 25, 25, 26, 26, 26, 27, 27, 28, 28,
    ],
  },
  {
    title: "Menus This Month",
    value: "15",
    interval: "Last 30 days",
    trend: "up",
    data: [
      2, 2, 1, 3, 2, 3, 2, 4, 3, 4, 3, 5, 4, 5, 4, 6, 5, 6, 5, 6, 5, 7, 5, 7, 6,
      7, 6, 8, 7, 8,
    ],
  },
  {
    title: "Archived",
    value: "8",
    interval: "All time",
    trend: "neutral",
    data: [
      0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ],
  },
  {
    title: "Drafts",
    value: "4",
    interval: "All time",
    trend: "down",
    data: [
      6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      4, 4, 4, 4, 4,
    ],
  },
];
export default function MenuList() {
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

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const res = await getMenus();
        const flat = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setTree(buildTree(flat));
      } catch (e) {
        console.error(e);
        setErr("Failed to load menus");
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
          x.title?.toLowerCase().includes(needle) ||
          x.route?.toLowerCase().includes(needle)
      );
    }
    if (status !== "all")
      r = r.filter((x) => (x.status || "").toLowerCase() === status);
    if (parentFilter !== "all") {
      r = r.filter((x) =>
        String(x.parent_id ?? "")
          .toLowerCase()
          .includes(parentFilter.toLowerCase())
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-400">
              Total Menus
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">120</CardContent>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-400">
              Menus This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">15</CardContent>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-400">Archived</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">8</CardContent>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-400">Drafts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">4</CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search menus…"
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

        <Button className="bg-neutral-800 hover:bg-neutral-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Menu
        </Button>
      </div>

      {/* Table */}
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
              <TableHead>Title</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead>Parent ID</TableHead>
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
                  <span style={{ paddingLeft: r.depth * 16 }}>
                    {fmt(r.title)}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.route)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.order)}
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
                    >
                      Update
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {current.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={13}
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
