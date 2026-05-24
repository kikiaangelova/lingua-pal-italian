import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/tutor-usage")({
  head: () => ({
    meta: [
      { title: "Tutor usage — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTutorUsagePage,
});

type UsageRow = {
  id: string;
  user_id: string;
  created_at: string;
  model: string | null;
  message_count: number;
  char_count: number;
  status: string;
};

const SPIKE_THRESHOLD_HOUR = 200;   // total calls in last hour
const PER_USER_HOUR_WARN = 40;      // any single user above this in last hour

function AdminTutorUsagePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" as any });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const load = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("tutor_chat_usage")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (active) {
        setRows((data ?? []) as UsageRow[]);
        setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 30_000);

    const channel = supabase
      .channel("tutor_chat_usage_admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tutor_chat_usage" },
        (payload) => {
          setRows((prev) => [payload.new as UsageRow, ...prev].slice(0, 1000));
        },
      )
      .subscribe();

    return () => {
      active = false;
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const now = Date.now();
    const lastHour = rows.filter((r) => now - +new Date(r.created_at) < 3_600_000);
    const last24 = rows;
    const perUser = new Map<string, number>();
    for (const r of lastHour) perUser.set(r.user_id, (perUser.get(r.user_id) ?? 0) + 1);
    const topUsers = [...perUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const rateLimited = rows.filter((r) => r.status === "rate_limited").length;
    const totalChars = last24.reduce((n, r) => n + (r.char_count ?? 0), 0);

    // hourly buckets for last 24h
    const buckets = new Array(24).fill(0);
    for (const r of last24) {
      const hoursAgo = Math.floor((now - +new Date(r.created_at)) / 3_600_000);
      if (hoursAgo >= 0 && hoursAgo < 24) buckets[23 - hoursAgo]++;
    }
    const maxBucket = Math.max(1, ...buckets);

    return {
      lastHourCount: lastHour.length,
      last24Count: last24.length,
      uniqueUsers24: new Set(last24.map((r) => r.user_id)).size,
      topUsers,
      rateLimited,
      totalChars,
      buckets,
      maxBucket,
    };
  }, [rows]);

  if (authLoading || isAdmin === null) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-2">
        <h1 className="text-xl font-semibold">Admin only</h1>
        <p className="text-sm text-muted-foreground">
          You don't have access to this page. Ask an existing admin to grant you the
          <code className="mx-1 px-1 rounded bg-muted">admin</code> role in
          <code className="mx-1 px-1 rounded bg-muted">user_roles</code>.
        </p>
      </div>
    );
  }

  const spike = stats.lastHourCount >= SPIKE_THRESHOLD_HOUR;
  const userSpike = stats.topUsers.find(([, n]) => n >= PER_USER_HOUR_WARN);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Luca usage monitor</h1>
        <p className="text-sm text-muted-foreground">
          Live view of tutor-chat calls in the last 24 hours. Refreshes every 30s and on each new call.
        </p>
      </header>

      {(spike || userSpike) && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm space-y-1">
          <div className="font-semibold text-destructive">⚠️ Usage spike detected</div>
          {spike && (
            <div>
              Last hour: <strong>{stats.lastHourCount}</strong> calls (threshold {SPIKE_THRESHOLD_HOUR}).
            </div>
          )}
          {userSpike && (
            <div>
              User <code>{userSpike[0].slice(0, 8)}…</code> made <strong>{userSpike[1]}</strong> calls in the last hour.
            </div>
          )}
        </div>
      )}

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Calls last hour" value={stats.lastHourCount} accent={spike ? "danger" : undefined} />
        <Stat label="Calls last 24h" value={stats.last24Count} />
        <Stat label="Unique users 24h" value={stats.uniqueUsers24} />
        <Stat label="Rate-limited 24h" value={stats.rateLimited} accent={stats.rateLimited > 0 ? "warn" : undefined} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">Calls per hour (last 24h)</h2>
        <div className="flex items-end gap-1 h-32">
          {stats.buckets.map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/70 rounded-t"
              style={{ height: `${(v / stats.maxBucket) * 100}%` }}
              title={`${v} calls, ${23 - i}h ago`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>24h ago</span><span>now</span>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">Top users (last hour)</h2>
        {stats.topUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity in the last hour.</p>
        ) : (
          <ul className="text-sm divide-y">
            {stats.topUsers.map(([uid, n]) => (
              <li key={uid} className="flex justify-between py-1.5">
                <code className="text-xs">{uid}</code>
                <span className={n >= PER_USER_HOUR_WARN ? "font-bold text-destructive" : ""}>{n} calls</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">Recent calls</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1 pr-2">When</th>
                  <th className="py-1 pr-2">User</th>
                  <th className="py-1 pr-2">Msgs</th>
                  <th className="py-1 pr-2">Chars</th>
                  <th className="py-1 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.created_at).toLocaleTimeString()}</td>
                    <td className="py-1 pr-2"><code>{r.user_id.slice(0, 8)}…</code></td>
                    <td className="py-1 pr-2">{r.message_count}</td>
                    <td className="py-1 pr-2">{r.char_count}</td>
                    <td className="py-1 pr-2">
                      <span className={r.status === "ok" ? "text-green-600" : "text-destructive"}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "warn" | "danger" }) {
  const color =
    accent === "danger" ? "text-destructive" : accent === "warn" ? "text-amber-600" : "";
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}