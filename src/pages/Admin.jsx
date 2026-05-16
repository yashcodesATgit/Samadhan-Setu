import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { listIssues, updateIssueStatus, readUpdates } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
// Load map dynamically
const MapView = lazy(() => import("@/components/map/MapView"));

// ============================================================
// AdminPage — Review and update civic issue statuses
// All data from localStorage — no backend needed
// ============================================================
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const router = { replace: (url) => navigate(url, { replace: true }) };

  // Redirect non-admins away
  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/");
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const [issues, setIssues]       = useState([]);
  const [updatesMap, setUpdatesMap] = useState({});
  const [q, setQ]                 = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [viewIssue, setViewIssue] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Load issues from localStorage
  const load = () => {
    setIssues(listIssues());
    setUpdatesMap(readUpdates());
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const counts = { total: issues.length, pending: 0, inProgress: 0, resolved: 0 };
    issues.forEach((i) => {
      const updates = updatesMap[String(i.id)] || [];
      const latest = updates.slice().sort((a, b) => b.ts - a.ts)[0];
      const s = (latest?.status || i.status || "").toLowerCase();
      if (s.includes("progress"))                                 counts.inProgress++;
      else if (["resolved", "completed", "closed"].includes(s))   counts.resolved++;
      else                                                         counts.pending++;
    });
    return counts;
  }, [issues, updatesMap]);

  // Filter issues by search + status
  const filtered = useMemo(() => {
    return issues
      .map((i) => {
        // Apply latest localStorage status
        const updates = updatesMap[String(i.id)] || [];
        const latest = updates.slice().sort((a, b) => b.ts - a.ts)[0];
        return latest ? { ...i, status: latest.status } : i;
      })
      .filter((i) => {
        const s = String(i.status || "").toLowerCase();
        const target = statusFilter.toLowerCase();

        const statusOk =
          statusFilter === "all" ||
          s === target ||
          (target === "pending" && (s === "open" || s === "reopen")) ||
          (target === "in_progress" && s.includes("progress")) ||
          (target === "resolved" && ["resolved", "completed", "closed"].includes(s));

        const qOk =
          !q.trim() ||
          [i.title, i.description, i.location].some((f) =>
            String(f || "").toLowerCase().includes(q.toLowerCase())
          );

        return statusOk && qOk;
      });
  }, [issues, updatesMap, statusFilter, q]);

  // Update an issue's status (with a message)
  const handleStatusChange = (id, newStatus) => {
    updateIssueStatus(id, newStatus, `Status changed to ${newStatus} by Admin`);
    load(); // refresh immediately
  };

  // Map markers
  const mapMarkers = issues
    .filter((i) => typeof i.lat === "number" && typeof i.lng === "number")
    .map((i) => ({
      id: i.id,
      position: [i.lat, i.lng],
      title: i.title,
      status: i.status,
      description: i.description,
      images: i.images || [],
    }));

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total"       value={stats.total}      color="bg-slate-800 text-white border-slate-700" />
        <StatCard title="Pending"     value={stats.pending}    color="bg-yellow-900/80 text-white border-yellow-800" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-teal-900 text-white border-teal-800" />
        <StatCard title="Resolved"    value={stats.resolved}   color="bg-green-800 text-white border-green-700" />
      </div>

      {/* Issues Map */}
      <Card>
        <CardHeader>
          <CardTitle>📍 Issues Map</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[400px] md:h-[480px] w-full flex items-center justify-center border bg-muted/50 rounded-md">Loading map...</div>}>
            <MapView markers={mapMarkers} heightClassName="h-[400px] md:h-[480px]" />
          </Suspense>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <Card>
        <CardHeader><CardTitle>🔍 Filter Issues</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Search by title, location, description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setQ(""); setStatusFilter("all"); }}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Issues list */}
      <Card>
        <CardHeader>
          <CardTitle>All Issues ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No issues match your filters.</p>
          )}

          {filtered.map((issue) => {
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
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Thumbnail */}
                  {(issue.images || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLightboxSrc(issue.images[0])}
                      className="flex-none"
                      aria-label="View image"
                    >
                      <img
                        src={issue.images[0]}
                        alt="thumb"
                        className="h-20 w-20 rounded-lg object-cover hover:scale-105 transition"
                      />
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Title + status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{issue.title}</h3>
                      <StatusBadge status={issue.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      📍 {issue.location}
                      {issue.created_at && (
                        <> &nbsp;•&nbsp; {new Date(issue.created_at).toLocaleDateString("en-IN")}</>
                      )}
                    </p>
                    {issue.description && (
                      <p className="mt-1 text-sm line-clamp-2">{issue.description}</p>
                    )}

                    {/* Latest update */}
                    {issueUpdates[0] && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last update: {issueUpdates[0].message} —{" "}
                        {new Date(issueUpdates[0].ts).toLocaleString("en-IN")}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Quick status updater */}
                      <select
                        className="rounded-md border bg-background px-3 py-1.5 text-sm cursor-pointer"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusChange(issue.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="" disabled>Update Status…</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setViewIssue(issue); setDetailOpen(true); }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Update history */}
                {issueUpdates.length > 0 && (
                  <div className="mt-3 space-y-1 border-t pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">History</p>
                    {issueUpdates.slice(0, 3).map((u, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                        <span>{u.message} — {new Date(u.ts).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Issue Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{viewIssue?.title}</span>
              {viewIssue && <StatusBadge status={viewIssue.status} />}
            </DialogTitle>
          </DialogHeader>
          {viewIssue && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Location:</strong> {viewIssue.location}</p>
                {viewIssue.lat && <p><strong>Coordinates:</strong> {viewIssue.lat.toFixed(5)}, {viewIssue.lng.toFixed(5)}</p>}
                {viewIssue.created_at && <p><strong>Reported:</strong> {new Date(viewIssue.created_at).toLocaleString("en-IN")}</p>}
              </div>
              {viewIssue.description && <p className="text-sm">{viewIssue.description}</p>}

              {/* Images */}
              {(viewIssue.images || []).length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {viewIssue.images.map((src, idx) => (
                      <button key={idx} type="button" onClick={() => setLightboxSrc(src)} aria-label={`Image ${idx + 1}`}>
                        <img src={src} alt={`img-${idx}`} className="h-20 w-20 rounded object-cover hover:opacity-90" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio */}
              {(viewIssue.audios || []).length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Voice Note</p>
                  {viewIssue.audios.map((a, i) => (
                    <audio key={i} src={a} controls className="w-full" />
                  ))}
                </div>
              )}

              {/* Update status from detail view */}
              <div>
                <p className="mb-2 text-sm font-semibold">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "in_progress", "resolved"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleStatusChange(viewIssue.id, s);
                        setViewIssue((prev) => prev ? { ...prev, status: s } : prev);
                      }}
                      className={viewIssue.status === s ? "border-primary bg-primary/10" : ""}
                    >
                      {s.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
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
