/**
 * Client-side localStorage wrapper for report history.
 * Used as primary storage when Vercel KV is not configured.
 */

export interface StoredReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
  // Extracted metrics for trend tracking
  hrv?: number;
  rhr?: number;
  sleep_hours?: number;
  deep_sleep_minutes?: number;
  rem_sleep_minutes?: number;
}

const REPORTS_KEY = "ask-my-body:reports";

export function saveReportLocal(report: StoredReport): void {
  const all = getReportsLocal();
  // Replace if same date exists
  const idx = all.findIndex((r) => r.date === report.date);
  if (idx >= 0) all[idx] = report;
  else all.push(report);
  // Keep last 30 days
  all.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all.slice(0, 30)));
}

export function getReportsLocal(): StoredReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredReport[];
  } catch {
    return [];
  }
}
