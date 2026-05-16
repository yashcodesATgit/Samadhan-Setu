// ============================================================
// storage.js
// Replaces Supabase — all data is saved in the browser's localStorage.
// localStorage is like a tiny database that lives in the user's browser.
// ============================================================

import { DEMO_ISSUES } from "./mockData";

const ISSUES_KEY = "samadhaan_issues";      // key used to store issues in localStorage
const UPDATES_KEY = "issue_updates";         // key used to store status update history

// ──────────────────────────────────────────────────────────────
// Internal helpers — read and write to localStorage safely
// ──────────────────────────────────────────────────────────────

function readIssues() {
  try {
    const raw = localStorage.getItem(ISSUES_KEY);
    if (raw) return JSON.parse(raw);

    // First time: seed with demo issues so the app isn't empty
    localStorage.setItem(ISSUES_KEY, JSON.stringify(DEMO_ISSUES));
    return DEMO_ISSUES;
  } catch {
    return DEMO_ISSUES;
  }
}

function writeIssues(issues) {
  try {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  } catch (e) {
    console.error("Failed to save issues:", e);
  }
}

function readUpdates() {
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUpdates(updates) {
  try {
    localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
  } catch (e) {
    console.error("Failed to save updates:", e);
  }
}

// ──────────────────────────────────────────────────────────────
// listIssues
// Returns all issues, newest first, with any status updates applied
// ──────────────────────────────────────────────────────────────
export function listIssues() {
  const issues = readIssues();
  const updates = readUpdates();

  // Sort by created_at, newest first
  const sorted = [...issues].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Attach status updates history to each issue
  return sorted.map((issue) => ({
    ...issue,
    updates: updates[String(issue.id)] || [],
  }));
}

// ──────────────────────────────────────────────────────────────
// createIssue
// Saves a new issue to localStorage.
// imageFiles are base64 data URLs (from FileReader).
// ──────────────────────────────────────────────────────────────
export async function createIssue({ title, description, location, lat, lng, imageDataUrls, audioUrl, userId }) {
  const issues = readIssues();

  // Generate a unique ID using timestamp + random string
  const newIssue = {
    id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId || "anonymous",
    title,
    description,
    location,
    status: "pending",
    lat: lat ?? null,
    lng: lng ?? null,
    images: imageDataUrls || [],   // base64 data URLs for images
    audios: audioUrl ? [audioUrl] : [],
    created_at: new Date().toISOString(),
    updates: [],
  };

  // Add to the beginning of the list (newest first)
  writeIssues([newIssue, ...issues]);

  return newIssue.id;
}

// ──────────────────────────────────────────────────────────────
// updateIssueStatus
// Changes the status of an issue and records a history entry.
// ──────────────────────────────────────────────────────────────
export function updateIssueStatus(issueId, newStatus, message = "") {
  // Update the status in the issues array
  const issues = readIssues();
  const updated = issues.map((i) =>
    String(i.id) === String(issueId) ? { ...i, status: newStatus } : i
  );
  writeIssues(updated);

  // Also record a history entry in the updates log
  const updates = readUpdates();
  const key = String(issueId);
  const entry = {
    message: message || `Status updated to ${newStatus}`,
    status: newStatus.toLowerCase(),
    ts: Date.now(),
  };
  updates[key] = [...(updates[key] || []), entry];
  writeUpdates(updates);
}

// Export the helpers for components that need them
export { readUpdates, writeUpdates };
