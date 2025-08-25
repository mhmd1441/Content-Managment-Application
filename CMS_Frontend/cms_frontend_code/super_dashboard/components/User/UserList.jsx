import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  initCsrf,
  get_users,
  get_new_users,
  get_total_users,
  delete_user,
} from "../../../src/services/api";
import StatCard from "../StatCard.jsx";
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
import Loader from "../../../src/lib/loading.jsx";



const fmt = (v) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

export default function UserList() {
  const navigate = useNavigate();

  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  const [newUsers, setNewUsers] = useState(0);
  const [totalUser, setTotalUsers] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      await initCsrf();
      const res = await get_users();
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRowsRaw(arr);
      setErr(null);
    } catch (e) {
      console.error(e);
      setErr("Failed to load Users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_new_users()
      .then((res) => setNewUsers(res?.data?.count ?? 0))
      .catch(() => setNewUsers(0));
  }, []);

  useEffect(() => {
    get_total_users()
      .then((res) => {
        const d = res?.data;
        const total =
          (typeof d === "number" && d) ||
          d?.count ||
          d?.total ||
          d?.data?.total ||
          d?.meta?.total ||
          0;
        setTotalUsers(Number(total));
      })
      .catch(() => setTotalUsers(0));
  }, []);

  useEffect(() => {
    if (did.current) return;
    did.current = true;
    load();
  }, []);

  const totalUsersDerived = useMemo(() => rowsRaw.length, [rowsRaw]);
  const totalUsersDisplay =
    totalUsersDerived > 0 ? totalUsersDerived : totalUser;

  const rows = useMemo(() => {
    let r = rowsRaw.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      r = r.filter(
        (x) =>
          String(x.id).includes(needle) ||
          x.first_name?.toLowerCase?.().includes(needle) ||
          x.last_name?.toLowerCase?.().includes(needle) ||
          x.email?.toLowerCase?.().includes(needle) ||
          x.phone_number?.toLowerCase?.().includes(needle) ||
          x.job_title?.toLowerCase?.().includes(needle)
      );
    }
    if (status !== "all")
      r = r.filter((x) => (x.status || "").toLowerCase() === status);
    if (role !== "all")
      r = r.filter((x) => (x.role || "").toLowerCase() === role);
    return r;
  }, [rowsRaw, q, status, role]);

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

  const handleUpdate = (id) => {
  if (!id) return;
  navigate(`/super_dashboard/user/edit/${id}`);
};

  const handleDelete = async (id) => {
    if (!id) return alert("Missing user id.");
    if (!window.confirm("Delete this user?")) return;
    try {
      await initCsrf();         
      await delete_user(id);     
      await load();              
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  const cards = [
    {
      title: "New Users This Month",
      value: String(newUsers),
      trend: "up",
      data: [],
    },
    {
      title: "Total Users",
      value: String(totalUsersDisplay),
      trend: "up",
      data: [],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" aria-busy="true">
        <Loader />
      </div>
    );
  }
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  const roleSet = new Set(
    rowsRaw.map((r) => (r.role || "").toLowerCase()).filter(Boolean)
  );
  const statusSet = new Set(
    rowsRaw.map((r) => (r.status || "").toLowerCase()).filter(Boolean)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-12 gap-4 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search by name, email, phone…"
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All statuses</SelectItem>
              {[...statusSet].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-neutral-900/60 border-neutral-800">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All roles</SelectItem>
              {[...roleSet].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/super_dashboard/user/createUser")}
            className="bg-neutral-800 hover:bg-neutral-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={current.length > 0 && selected.size === current.length}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Supervisor ID</TableHead>
              <TableHead>Department ID</TableHead>
              <TableHead>Role</TableHead>
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
                <TableCell className="text-neutral-200">{fmt(r.first_name)}</TableCell>
                <TableCell className="text-neutral-200">{fmt(r.last_name)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(r.job_title)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(r.phone_number)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(r.email)}</TableCell>
                <TableCell className="text-neutral-300">
                  {r.password ? "••••••••" : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      "inline-flex items-center rounded px-2 py-0.5 text-xs " +
                      (String(r.status).toLowerCase() === "active"
                        ? "bg-emerald-900/30 text-emerald-300"
                        : "bg-neutral-800 text-neutral-300")
                    }
                  >
                    {fmt(r.status)}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-400">{fmt(r.created_by)}</TableCell>
                <TableCell className="text-neutral-400">{fmt(r.updated_by)}</TableCell>
                <TableCell className="text-neutral-400">{fmt(r.supervisor_id)}</TableCell>
                <TableCell className="text-neutral-400">{fmt(r.department_id)}</TableCell>
                <TableCell className="text-neutral-400">{fmt(r.role)}</TableCell>
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
                <TableCell colSpan={19} className="text-center py-10 text-neutral-500">
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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
