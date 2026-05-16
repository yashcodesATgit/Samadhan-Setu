
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { listIssues, readUpdates } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";

// ============================================================
// DashboardPage — shows all issues with stats & status history
// No backend — reads from localStorage
// ============================================================
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const router = { replace: (url) => navigate(url, { replace: true }) };

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const [tab, setTab] = useState("all");
  const [issues, setIssues] = useState([]);
  const [updatesMap, setUpdatesMap] = useState({});
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Load issues and status updates from localStorage
  const load = () => {
    setIssues(listIssues());
    setUpdatesMap(readUpdates());
  };

  useEffect(() => {
    load();
    // Refresh every 3 seconds in case another tab updates something
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter issues based on the active tab
  const filtered = useMemo(() => {
    if (tab === "mine") return issues.filter((i) => i.user_id === user?.id);
    if (tab === "all")  return issues;

    return issues.filter((i) => {
      // Check localStorage for the most recent status update
      const updates = updatesMap[String(i.id)] || [];
      const latest = updates.slice().sort((a, b) => b.ts - a.ts)[0];
      const s = (latest?.status || i.status || "").toLowerCase();

      if (tab === "pending")     return s === "pending" || s === "open";
      if (tab === "in_progress") return s.includes("progress");
      if (tab === "resolved")    return ["resolved", "completed", "closed"].includes(s);
      return true;
    });
  }, [issues, tab, user, updatesMap]);

  // Compute summary stats
  const stats = useMemo(() => {
    const counts = { total: issues.length, pending: 0, inProgress: 0, resolved: 0 };
    issues.forEach((i) => {
      const updates = updatesMap[String(i.id)] || [];
      const latest = updates.slice().sort((a, b) => b.ts - a.ts)[0];
      const s = (latest?.status || i.status || "").toLowerCase();
      if (s.includes("progress"))                                counts.inProgress++;
      else if (["resolved", "completed", "closed"].includes(s))  counts.resolved++;
      else                                                        counts.pending++;
    });
    return counts;
  }, [issues, updatesMap]);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">
            Hello{user?.name ? `, ${String(user.name).split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your reported issues and see status updates.
          </p>
        </div>
        {user?.role === "citizen" && (
          <Button asChild>
            <Link to="/report">+ Report a Civic Issue</Link>
          </Button>
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Issues"  value={stats.total}      color="bg-slate-800 text-white border-slate-700" />
        <StatCard title="Pending"       value={stats.pending}    color="bg-yellow-900/80 text-white border-yellow-800" />
        <StatCard title="In Progress"   value={stats.inProgress} color="bg-teal-900 text-white border-teal-800" />
        <StatCard title="Resolved"      value={stats.resolved}   color="bg-green-800 text-white border-green-700" />
      </div>

      {/* Issues list with filter tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap w-full gap-1 h-auto">
              <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
              <TabsTrigger value="mine">Mine</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4 space-y-4">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No issues found for this filter.
                </p>
              )}

              {filtered.map((issue) => {
                // Get the most recent status update for this issue
                const issueUpdates = (updatesMap[String(issue.id)] || [])
                  .slice()
                  .sort((a, b) => b.ts - a.ts);

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border p-4 shadow-sm"
                  >
                    {/* Issue title + status badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-base">{issue.title}</h3>
                      <StatusBadge status={issueUpdates[0]?.status || issue.status} />
                    </div>

                    {/* Location + date */}
                    <p className="mt-1 text-sm text-muted-foreground">
                      📍 {issue.location}
                      {issue.created_at && (
                        <> &nbsp;•&nbsp; {new Date(issue.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                      )}
                    </p>

                    {/* Description */}
                    {issue.description && (
                      <p className="mt-2 text-sm">{issue.description}</p>
                    )}

                    <Separator className="my-3" />

                    {/* Image thumbnails */}
                    {Array.isArray(issue.images) && issue.images.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {issue.images.slice(0, 4).map((src, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxSrc(src)}
                            className="rounded-md overflow-hidden focus:ring-2 focus:ring-primary"
                            aria-label={`View image ${idx + 1}`}
                          >
                            <img src={src} alt={`img-${idx}`} className="h-14 w-14 rounded object-cover hover:scale-105 transition" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Status update history */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status History</p>
                      {issueUpdates.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No updates yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {issueUpdates.map((u, idx) => (
                            <div key={idx} className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2">
                              <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary" />
                              <div>
                                <p className="text-xs">{u.message}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(u.ts).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image lightbox dialog */}
      <Dialog open={!!lightboxSrc} onOpenChange={(o) => { if (!o) setLightboxSrc(null); }}>
        <DialogContent className="sm:max-w-3xl">
          {lightboxSrc && (
            <img src={lightboxSrc} alt="Full view" className="max-h-[75vh] w-full rounded object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// A stat card with animation
function StatCard({ title, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={color}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-70">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
