import { Badge } from "@/components/ui/badge";

// ------------------------------------------------------------
// StatusBadge Component
// Shows a colored badge based on the issue's status
//
// Props:
//   status - a string like "pending", "in_progress", "resolved", etc.
// ------------------------------------------------------------
export default function StatusBadge({ status }) {
  // Normalize status to lowercase for consistent matching
  const s = String(status || "").toLowerCase();

  // Map each status to a display label and CSS classes for color
  const map = {
    pending:     { label: "Pending",     className: "bg-amber-100 text-amber-900 hover:bg-amber-100" },
    open:        { label: "Open",        className: "bg-amber-100 text-amber-900 hover:bg-amber-100" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-900 hover:bg-blue-100" },
    resolved:    { label: "Resolved",    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100" },
    completed:   { label: "Resolved",    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100" },
    closed:      { label: "Resolved",    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100" },
  };

  // Use the matched config, or fall back to showing the raw status text
  const cfg = map[s] ?? { label: status };

  return (
    <Badge className={`px-2 py-0.5 text-xs ${cfg.className ?? ""}`}>
      {cfg.label}
    </Badge>
  );
}
