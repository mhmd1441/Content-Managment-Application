import { useEffect, useMemo, useRef, useState } from "react";
import { initCsrf, get_users , get_departments } from "../../../src/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

const fmt = (v) => (v ?? "—");

export default function UserList() {
  const [rows, setRows] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const did = useRef(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const [open, setOpen] = useState(false);
  const emptyForm = { first_name:"", last_name:"", job_title:"", phone_number:"", email:"", password:"", status:"active", supervisor_id:"", department_id:"", role:"user" };
  const [form, setForm] = useState(emptyForm);

  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      await initCsrf();
      const [uRes, dRes] = await Promise.all([get_users(), get_departments()]);
      const users = Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || [];
      const dep = Array.isArray(dRes.data) ? dRes.data : dRes.data?.data || [];
      setRows(users);
      setDepts(dep);
      setErr(null);
    } catch (e) {
      console.error(e);
      setErr("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      if (did.current) return;
      did.current = true;
      load();
    }, []);

    const filtered = useMemo(() => {
      let r = rows.slice();
      if (q.trim()) {
        const needle = q.toLowerCase();
        r = r.filter(x =>
          String(x.id).includes(needle) ||
          x.first_name?.toLowerCase?.().includes(needle) ||
          x.last_name?.toLowerCase?.().includes(needle) ||
          x.email?.toLowerCase?.().includes(needle) ||
          x.phone_number?.toLowerCase?.().includes(needle) ||
          x.job_title?.toLowerCase?.().includes(needle)
        );
      }
      if (status !== "all") r = r.filter(x => (x.status || "").toLowerCase() === status);
      if (role !== "all") r = r.filter(x => (x.role || "").toLowerCase() === role);
      return r;
    }, [rows, q, status, role]);

  if (loading) return <div className="p-6 text-sm text-neutral-300">Loading users…</div>;
  if (err) return <div className="p-6 text-sm text-red-400">{err}</div>;

  const roleSet = new Set(rows.map(r => (r.role || "").toLowerCase()).filter(Boolean));
  const statusSet = new Set(rows.map(r => (r.status || "").toLowerCase()).filter(Boolean));

  return (
    <div className="bd-container space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone…" className="pl-8 bg-neutral-900/60 border-neutral-800" />
          </div>

          <Select value={status} onValueChange={v => setStatus(v)}>
            <SelectTrigger className="w-[150px] bg-neutral-900/60 border-neutral-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All statuses</SelectItem>
              {[...statusSet].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={v => setRole(v)}>
            <SelectTrigger className="w-[150px] bg-neutral-900/60 border-neutral-800"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All roles</SelectItem>
              {[...roleSet].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* table */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={(v) => setSelected(v ? new Set(filtered.map(r => r.id)) : new Set())}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>First</TableHead>
              <TableHead>Last</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id} className="border-neutral-900">
                <TableCell><Checkbox checked={selected.has(u.id)} onCheckedChange={() => {
                  setSelected(prev => {
                    const next = new Set(prev);
                    next.has(u.id) ? next.delete(u.id) : next.add(u.id);
                    return next;
                  });
                }} /></TableCell>
                <TableCell className="text-neutral-300">{fmt(u.id)}</TableCell>
                <TableCell className="text-neutral-200">{fmt(u.first_name)}</TableCell>
                <TableCell className="text-neutral-200">{fmt(u.last_name)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(u.email)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(u.phone_number)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(u.job_title)}</TableCell>
                <TableCell>
                  <span className={"inline-flex rounded px-2 py-0.5 text-xs " + (String(u.status).toLowerCase()==="active" ? "bg-emerald-900/30 text-emerald-300" : "bg-neutral-800 text-neutral-300")}>
                    {fmt(u.status)}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-300">{fmt(u.role)}</TableCell>
                <TableCell className="text-neutral-300">{fmt(u.department_id)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" className="bg-neutral-800 hover:bg-neutral-700" onClick={() => openEdit(u)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(u.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center py-10 text-neutral-500">No users</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <Input placeholder="First name" value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} />
            <Input placeholder="Last name" value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} />
            <Input placeholder="Email" type="email" className="sm:col-span-2" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            <Input placeholder="Phone number" value={form.phone_number} onChange={e => setForm(f => ({...f, phone_number: e.target.value}))} />
            <Input placeholder="Job title" value={form.job_title} onChange={e => setForm(f => ({...f, job_title: e.target.value}))} />
            <Select value={String(form.status)} onValueChange={v => setForm(f => ({...f, status: v}))}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(form.role)} onValueChange={v => setForm(f => ({...f, role: v}))}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="business">business</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(form.department_id || "")} onValueChange={v => setForm(f => ({...f, department_id: v}))}>
              <SelectTrigger className="sm:col-span-2"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— none —</SelectItem>
                {depts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input placeholder="Supervisor ID (optional)" value={form.supervisor_id} onChange={e => setForm(f => ({...f, supervisor_id: e.target.value}))} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
