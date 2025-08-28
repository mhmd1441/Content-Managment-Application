<?php

namespace App\Http\Controllers;

use App\Models\ActivitySession;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ActivityController extends Controller
{
    // POST /api/activity/session/start
    public function startSession(Request $req) {
        $user = $req->user();
        $req->validate([
            'tab_id' => 'required|string|max:64',
            'parent_path' => 'nullable|string|max:64',
        ]);

        $timeoutAt = now()->subMinutes(30);
        $stales = \App\Models\ActivitySession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->where('last_seen_at', '<', $timeoutAt)
            ->get();

        foreach ($stales as $stale) {
            $now = now();
            $stale->ended_at   = $now;
            $stale->end_reason = 'timeout';
            $stale->save();

            PageView::where('session_id', $stale->id)
                ->whereNull('left_at')
                ->get()
                ->each(function (PageView $pv) use ($now) {
                    $pv->left_at = $now;
                    $pv->duration_seconds = max(0, $now->diffInSeconds($pv->entered_at));
                    $pv->save();
                });
        }

        // Reuse open session for this user+tab if exists
        $open = ActivitySession::where('user_id', $user->id)
            ->where('tab_id', $req->tab_id)
            ->whereNull('ended_at')
            ->orderByDesc('started_at')
            ->first();

        $now = now();
        if ($open) {
            $open->last_seen_at = $now;
            $open->save();
            return response()->json(['session_id' => $open->id]);
        }

        $s = ActivitySession::create([
            'id'          => (string) Str::uuid(),
            'user_id'     => $user->id,
            'tab_id'      => $req->tab_id,
            'parent_path' => $req->parent_path,
            'started_at'  => $now,
            'last_seen_at'=> $now,
            'ip'          => $req->ip(),
            'user_agent'  => substr($req->header('User-Agent') ?? '', 0, 1024),
        ]);

        return response()->json(['session_id' => $s->id]);
    }

    // POST /api/activity/heartbeat
    public function heartbeat(Request $req) {
        $user = $req->user();
        if (!$user) return response()->json(['error' => 'unauthenticated'], 401);
        $req->validate(['session_id' => 'required|uuid']);
        $s = ActivitySession::where('id', $req->session_id)->where('user_id', $user->id)->first();
        if (!$s) return response()->json(['ok' => true]); // idempotent
        $s->last_seen_at = now();
        $s->save();
        return response()->json(['ok' => true]);
    }


    // POST /api/activity/pageview/start
    public function startPageView(Request $req) {
        try {
            $user = $req->user();
            if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

            $req->validate([
                'session_id' => 'required|uuid',
                'path'       => 'required|string|max:1024', // allow long URLs
                'title'      => 'nullable|string|max:512',
            ]);

            $s = ActivitySession::where('id', $req->input('session_id'))
                ->where('user_id', $user->id)
                ->firstOrFail();

            $now = now();

            // Close any open PVs first
            PageView::where('session_id', $s->id)
                ->whereNull('left_at')
                ->get()
                ->each(function (PageView $pv) use ($now) {
                    $pv->left_at = $now;
                    $pv->duration_seconds = max(0, $now->diffInSeconds($pv->entered_at));
                    $pv->save();
                });

            // Make sure values fit current schema (path 255, title 255 in your migration)
            $path  = (string) $req->input('path');
            $title = $req->input('title');
            $pathForDb  = mb_substr($path, 0, 255);
            $titleForDb = $title ? mb_substr($title, 0, 255) : null;

            $pv = PageView::create([
                'session_id' => $s->id,
                'path'       => $pathForDb,
                'title'      => $titleForDb,
                'entered_at' => $now,
            ]);

            $s->last_seen_at = $now;
            $s->save();

            return response()->json(['page_view_id' => $pv->id, 'session_id' => $s->id]);
        } catch (\Throwable $e) {
            \Log::error('startPageView failed', ['msg' => $e->getMessage()]);
            return response()->json(['error' => 'pageview_start_failed', 'message' => $e->getMessage()], 500);
        }
    }


    // POST /api/activity/pageview/end
    public function endPageView(Request $req) {
        try {
            $user = $req->user();
            if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

            $req->validate([
                'page_view_id' => 'required|uuid',
                'left_at'      => 'nullable|date',
            ]);

            // Load PV + verify user owns the session
            $pv = PageView::find($req->page_view_id);
            if (!$pv) return response()->json(['ok' => true]);

            $session = ActivitySession::where('id', $pv->session_id)
                ->where('user_id', $user->id)->first();
            if (!$session) return response()->json(['ok' => true]);

            // Pick the effective left_at
            $left = $req->left_at ? \Carbon\Carbon::parse($req->left_at) : now();
            // Use the newer of existing left_at and request left_at
            if ($pv->left_at && $left->lt(\Carbon\Carbon::parse($pv->left_at))) {
                $left = \Carbon\Carbon::parse($pv->left_at);
            }

            // *** ATOMIC DB-SIDE COMPUTE (PostgreSQL) ***
            // duration_seconds = seconds_between(left_at, entered_at)
            \DB::update(
                "UPDATE page_views
             SET left_at = ?,
                 duration_seconds = GREATEST(
                   0, EXTRACT(EPOCH FROM (?::timestamptz - entered_at))::int
                 )
             WHERE id = ?",
                [$left, $left, $pv->id]
            );

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            \Log::error('endPageView failed', ['msg' => $e->getMessage()]);
            return response()->json(['error' => 'pageview_end_failed', 'message' => $e->getMessage()], 500);
        }
    }



    public function sessionsByRole(Request $req)
    {
        $days       = max(1, (int) $req->query('days', 30));
        $parentPath = $req->query('parent_path'); // optional

        $end   = Carbon::today();
        $start = (clone $end)->subDays($days - 1);

        // Count sessions per day per role
        $rows = DB::table('activity_sessions as s')
            ->join('users as u', 'u.id', '=', 's.user_id')
            ->selectRaw('DATE(s.started_at) as day, u.role, COUNT(*) as c')
            ->whereBetween('s.started_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($parentPath, fn ($q) => $q->where('s.parent_path', $parentPath))
            ->groupBy('day', 'u.role')
            ->orderBy('day')
            ->get();

        // Index by day→role
        $byDayRole = [];
        foreach ($rows as $r) {
            $d = Carbon::parse($r->day)->toDateString();
            $byDayRole[$d][$r->role] = (int) $r->c;
        }

        // Build continuous series with zeros for missing days
        $labels = [];
        $sa = []; $ba = []; $us = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $labels[] = $cursor->format('M j');
            $sa[] = $byDayRole[$key]['super_admin']    ?? 0;
            $ba[] = $byDayRole[$key]['business_admin'] ?? 0;
            $us[] = $byDayRole[$key]['user']           ?? 0;
            $cursor->addDay();
        }

        return response()->json([
            'labels' => $labels,
            'series' => [
                'super_admin'    => $sa,
                'business_admin' => $ba,
                'user'           => $us,
            ],
            'totals' => [
                'super_admin'    => array_sum($sa),
                'business_admin' => array_sum($ba),
                'user'           => array_sum($us),
                'all'            => array_sum($sa) + array_sum($ba) + array_sum($us),
            ],
        ]);
    }



    // POST /api/activity/session/end
    public function endSession(Request $req) {
        try {
            $user = $req->user();
            if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

            $req->validate([
                'session_id' => 'required|uuid',
                'reason'     => 'nullable|string|in:logout,timeout,unload,navigate_away,unknown',
            ]);

            $s = ActivitySession::where('id', $req->session_id)
                ->where('user_id', $user->id)
                ->first();
            if (!$s) return response()->json(['ok' => true]); // idempotent

            $now = now();
            if ($s->ended_at === null) {
                $s->ended_at    = $now;
                $s->end_reason  = $req->reason ?? 'unknown';
                $s->last_seen_at= $now;
                $s->save();

                PageView::where('session_id', $s->id)
                    ->whereNull('left_at')
                    ->get()
                    ->each(function (PageView $pv) use ($now) {
                        $pv->left_at = $now;
                        $pv->duration_seconds = max(0, $now->diffInSeconds($pv->entered_at));
                        $pv->save();
                    });
            }
            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            \Log::error('endSession failed', ['msg' => $e->getMessage()]);
            return response()->json(['error' => 'session_end_failed', 'message' => $e->getMessage()], 500);
        }
    }


    public function sessionsTable(Request $req)
    {
        // inputs
        $parentPath = $req->query('parent_path'); // optional
        $role       = $req->query('role', 'all'); // super_admin|business_admin|user|all
        $status     = $req->query('status', 'all'); // active|inactive|all
        $q          = trim($req->query('q', ''));

        $page       = max(1, (int) $req->query('page', 1));
        $perPage    = min(100, max(1, (int) $req->query('per_page', 10)));

        // date range (default last 7 days) capped to 30 days
        $endStr   = $req->query('end_date')   ?: now()->toDateString();
        $startStr = $req->query('start_date') ?: Carbon::parse($endStr)->subDays(6)->toDateString();

        $end   = Carbon::parse($endStr)->endOfDay();
        $start = Carbon::parse($startStr)->startOfDay();

        if ($start->diffInDays($end) > 30) {
            $start = (clone $end)->subDays(29)->startOfDay();
        }

        $base = DB::table('page_views as pv')
            ->join('activity_sessions as s', 's.id', '=', 'pv.session_id')
            ->join('users as u', 'u.id', '=', 's.user_id')
            ->select([
                'pv.id as page_view_id',
                's.id  as session_id',
                'u.id  as user_id',
                DB::raw("TRIM(CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,''))) as user_name"),
                'u.job_title',
                'u.role',
                'pv.path',
                'pv.entered_at',
                'pv.left_at',
                's.started_at as session_started_at',
                's.ended_at   as session_ended_at',
                's.parent_path',
            ])
            ->whereBetween('pv.entered_at', [$start, $end]);

        // parent_path filter (support both schemas: parent_path OR legacy path)
        if (!empty($parentPath)) {
            $base->where(function ($q2) use ($parentPath) {
                $q2->where('s.parent_path', $parentPath)
                    ->orWhere('s.path', $parentPath); // legacy column support
            });
        }

        if (in_array($role, ['super_admin','business_admin','user'], true)) {
            $base->where('u.role', $role);
        }
        if ($status === 'active')      $base->whereNull('s.ended_at');
        elseif ($status === 'inactive')$base->whereNotNull('s.ended_at');

        if ($q !== '') {
            $like = '%'.$q.'%';
            $base->where(function ($qq) use ($like) {
                $qq->where('u.first_name', 'like', $like)
                    ->orWhere('u.last_name',  'like', $like)
                    ->orWhere('u.email',      'like', $like)
                    ->orWhere('u.job_title',  'like', $like)
                    ->orWhere('pv.path',      'like', $like);
            });
        }

        $total = (clone $base)->count();

        $rows = (clone $base)
            ->orderBy('pv.entered_at', 'desc')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $now = now();
        $out = [];
        foreach ($rows as $r) {
            $entered  = $r->entered_at ? Carbon::parse($r->entered_at) : null;
            $left     = $r->left_at    ? Carbon::parse($r->left_at)    : $now;
            $duration = ($entered ? $left->diffInSeconds($entered) : 0);

            $out[] = [
                'page_view_id'     => $r->page_view_id,
                'session_id'       => $r->session_id,
                'user_id'          => $r->user_id,
                'user_name'        => $r->user_name,
                'job_title'        => $r->job_title,
                'role'             => $r->role,
                'path'             => $r->path,
                'entered_at'       => $r->entered_at,
                'left_at'          => $r->left_at,
                'duration_seconds' => $duration,
                'session_status'   => $r->session_ended_at === null ? 'active' : 'inactive',
            ];
        }

        return response()->json([
            'rows'     => $out,
            'page'     => $page,
            'per_page' => $perPage,
            'total'    => $total,
            'start'    => $start->toDateString(),
            'end'      => $end->toDateString(),
        ]);
    }
    public function dashboardVisits(Request $request)
    {
        $months = max(1, min(24, (int) $request->query('months', 6)));
        // metric=users|sessions|pageviews (default: users = distinct people)
        $metric = $request->query('metric', 'users');

        $start = now()->startOfMonth()->subMonths($months - 1);
        $end   = now()->endOfMonth();

        // Labels & YM keys
        $labels = []; $ymKeys = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $labels[] = $cursor->format('M');      // Jan, Feb, ...
            $ymKeys[] = $cursor->format('Y-m');    // 2025-08
            $cursor->addMonth();
        }
        $ymIndex = array_flip($ymKeys);

        // Map each PV (or session) to a dashboard + month + owner
        $base = DB::table('page_views as pv')
            ->join('activity_sessions as s', 's.id', '=', 'pv.session_id')
            ->selectRaw("
            CASE
              WHEN s.parent_path = '/super_dashboard'    OR pv.path LIKE '/super_dashboard%'    THEN 'super'
              WHEN s.parent_path = '/business_dashboard' OR pv.path LIKE '/business_dashboard%' THEN 'business'
              WHEN s.parent_path = '/user_dashboard'     OR pv.path LIKE '/user_dashboard%'     THEN 'user'
              ELSE NULL
            END AS dashboard,
            to_char(date_trunc('month', COALESCE(pv.entered_at, s.started_at)), 'YYYY-MM') as ym,
            s.user_id,
            s.id as session_id
        ")
            ->whereBetween(DB::raw("COALESCE(pv.entered_at, s.started_at)"), [$start, $end]);

        // Aggregate per requested metric
        $rows = match ($metric) {
            'sessions'  => DB::query()->fromSub($base, 'b')
                ->selectRaw("dashboard, ym, COUNT(DISTINCT session_id)::int as c")
                ->whereNotNull('dashboard')
                ->groupBy('dashboard','ym')->get(),
            'pageviews' => DB::query()->fromSub($base, 'b')
                ->selectRaw("dashboard, ym, COUNT(*)::int as c")
                ->whereNotNull('dashboard')
                ->groupBy('dashboard','ym')->get(),
            default     => DB::query()->fromSub($base, 'b') // users
            ->selectRaw("dashboard, ym, COUNT(DISTINCT user_id)::int as c")
                ->whereNotNull('dashboard')
                ->groupBy('dashboard','ym')->get(),
        };

        $series = [
            'super'    => array_fill(0, count($labels), 0),
            'business' => array_fill(0, count($labels), 0),
            'user'     => array_fill(0, count($labels), 0),
        ];

        foreach ($rows as $r) {
            if (!isset($ymIndex[$r->ym])) continue;
            $series[$r->dashboard][$ymIndex[$r->ym]] = (int) $r->c;
        }

        return response()->json(compact('labels','series'));
    }


}
