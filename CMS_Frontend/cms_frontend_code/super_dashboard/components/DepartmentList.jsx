import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, get_departments } from "../../src/services/api";
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
import Loader from "../../src/lib/loading.jsx";

const fmt = (v) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

export default function DepartmentList() {
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    (async () => {
      try {
        await initCsrf();
        const res = await get_departments();
        const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRowsRaw(arr);
      } catch (e) {
        console.error(e);
        setErr("Failed to load Departments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    let r = rowsRaw.slice();

    if (q.trim()) {
      const needle = q.toLowerCase();
      r = r.filter(
        (x) =>
          String(x.id).includes(needle) ||
          x.name?.toLowerCase?.().includes(needle) ||
          x.country?.toLowerCase?.().includes(needle) ||
          x.city?.toLowerCase?.().includes(needle)
      );
    }
    if (country !== "all")
      r = r.filter((x) => (x.country || "").toLowerCase() === country);
    if (city !== "all")
      r = r.filter((x) => (x.city || "").toLowerCase() === city);
    return r;
  }, [rowsRaw, q, country, city]);

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

  const countrySet = new Set(
    rowsRaw.map((r) => (r.country || "").toLowerCase()).filter(Boolean)
  );
  const citySet = new Set(
    rowsRaw.map((r) => (r.city || "").toLowerCase()).filter(Boolean)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-400">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rows.length}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search by id, name, country, city…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-8 bg-neutral-900/60 border-neutral-800"
            />
          </div>

          <Select
            value={country}
            onValueChange={(v) => {
              setCountry(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-neutral-900/60 border-neutral-800">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All countries</SelectItem>
              {[...countrySet].map((c) => (
                <SelectItem key={c} value={c}>
                  {c || "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={city}
            onValueChange={(v) => {
              setCity(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-neutral-900/60 border-neutral-800">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All cities</SelectItem>
              {[...citySet].map((c) => (
                <SelectItem key={c} value={c}>
                  {c || "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-neutral-800 hover:bg-neutral-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Department
        </Button>
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
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Director ID</TableHead>
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
                  />
                </TableCell>
                <TableCell className="text-neutral-300">{fmt(r.id)}</TableCell>
                <TableCell className="text-neutral-200">
                  {fmt(r.name)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.country)}
                </TableCell>
                <TableCell className="text-neutral-300">
                  {fmt(r.city)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.created_by)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.updated_by)}
                </TableCell>
                <TableCell className="text-neutral-400">
                  {fmt(r.director_id)}
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
                  colSpan={11}
                  className="text-center py-10 text-neutral-500"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
