import * as React from "react";
import {
  Card, CardContent, Stack, Typography, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, TableFooter, Button, LinearProgress
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import { activity_sessions_table } from "@/services/api";

function fmtDate(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}
function fmtHMS(totalSec) {
  const s = Math.max(0, Math.floor(totalSec || 0));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
function todayISO() { return new Date().toISOString().slice(0,10); }
function daysAgoISO(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0,10);
}

export default function SessionsTable({ parentPath = null }) {
  const [start, setStart] = React.useState(daysAgoISO(6)); // default last 7 days
  const [end, setEnd] = React.useState(todayISO());
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all"); // active|inactive|all
  const [q, setQ] = React.useState("");

  // table state
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // clamp date range to 30 days max on any change
  function clampRange(newStart, newEnd) {
    const sd = new Date(newStart);
    const ed = new Date(newEnd);
    const ms = 30 * 24 * 3600 * 1000;
    if (ed - sd > ms) {
      // snap start to (end - 29d)
      const s2 = new Date(ed.getTime() - (29 * 24 * 3600 * 1000));
      return [s2.toISOString().slice(0,10), newEnd];
    }
    return [newStart, newEnd];
  }

  // debounced search typing
  const qRef = React.useRef(q);
  React.useEffect(() => { qRef.current = q; }, [q]);

  async function fetchRows(p = page, size = perPage) {
    setLoading(true);
    try {
     const params = {
     page: p, per_page: size,
     start_date: start, end_date: end,
     role, status, q,
     ...(parentPath ? { parent_path: parentPath } : {}),
      };
      const { data } = await activity_sessions_table(params);
      setRows(data.rows || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPerPage(data.per_page || size);
    } catch (err) {
      console.error("Sessions table error", err);
      setRows([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // refetch when filters change
  React.useEffect(() => {
    // reset to first page on filter change
    setPage(1);
    const t = setTimeout(() => fetchRows(1, perPage), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, role, status, q, parentPath]);

  // refetch when page/perPage changes
  React.useEffect(() => { fetchRows(page, perPage); /* eslint-disable-next-line */ }, [page, perPage]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      {loading && <LinearProgress />}
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography component="h2" variant="subtitle2">Sessions (page views)</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Showing {rows.length} of {total} results
          </Typography>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Start date"
            type="date"
            value={start}
            onChange={(e) => {
              const [s2, e2] = clampRange(e.target.value, end);
              setStart(s2); setEnd(e2);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="End date"
            type="date"
            value={end}
            onChange={(e) => {
              const [s2, e2] = clampRange(start, e.target.value);
              setStart(s2); setEnd(e2);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select labelId="role-label" label="Role" value={role} onChange={(e)=>setRole(e.target.value)}>
              <MenuItem value="all">All roles</MenuItem>
              <MenuItem value="super_admin">Super admin</MenuItem>
              <MenuItem value="business_admin">Business admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Session Status</InputLabel>
            <Select labelId="status-label" label="Session Status" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search user / path"
            placeholder="Name, email, job title or path…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchRounded fontSize="small"/></InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Job title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entered</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Left</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Session</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                    No data to display for this filter.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.page_view_id} hover>
                  <TableCell>{r.user_id}</TableCell>
                  <TableCell>{r.user_name}</TableCell>
                  <TableCell>{r.job_title || "—"}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{r.role}</TableCell>
                  <TableCell title={r.path} sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.path}
                  </TableCell>
                  <TableCell>{fmtDate(r.entered_at)}</TableCell>
                  <TableCell>{fmtDate(r.left_at)}</TableCell>
                  <TableCell align="right">{fmtHMS(r.duration_seconds)}</TableCell>
                  <TableCell align="center">
                    {r.session_status === "active" ? (
                      <Stack direction="row" gap={0.5} alignItems="center" justifyContent="center" sx={{ color: "success.main", fontSize: 12 }}>
                        <CheckCircleRounded fontSize="inherit" /> Active
                      </Stack>
                    ) : (
                      <Stack direction="row" gap={0.5} alignItems="center" justifyContent="center" sx={{ color: "text.secondary", fontSize: 12 }}>
                        <CancelRounded fontSize="inherit" /> Inactive
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Page {page} of {totalPages}
                    </Typography>
                    <TextField
                      size="small"
                      label="Rows"
                      select
                      value={perPage}
                      onChange={(e)=>setPerPage(Number(e.target.value))}
                      sx={{ width: 100 }}
                    >
                      {[10, 20, 50, 100].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </TextField>
                  </Stack>
                </TableCell>
                <TableCell colSpan={4} align="right">
                  <Stack direction="row" gap={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ArrowBackIosNewRounded />}
                      disabled={page <= 1 || loading}
                      onClick={()=>setPage(p => Math.max(1, p-1))}
                    >
                      Prev
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForwardIosRounded />}
                      disabled={page >= totalPages || loading}
                      onClick={()=>setPage(p => Math.min(totalPages, p+1))}
                    >
                      Next
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
