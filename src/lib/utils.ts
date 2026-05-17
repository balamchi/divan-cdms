import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalizes raw ClickUp statuses (which vary per list) into 3 buckets used
// across portal UI: "todo", "in_progress", "approved_or_done".
export type NormalizedStatus = "todo" | "in_progress" | "approved_or_done";

export function normalizeStatus(raw: string | null | undefined): NormalizedStatus {
  const s = (raw || "").toLowerCase().trim();
  if (s === "approved" || s === "complete" || s === "completed") return "approved_or_done";
  if (s === "in progress") return "in_progress";
  return "todo";
}

// Anonymity rule (Phase 3): clients never see individual team-member names.
// For team / admin viewers, the real ClickUp assignees are returned.
export interface AssigneeChip {
  label: string;
  initials: string;
  isTeamBrand?: boolean;
}

export function displayAssignees(
  assignees: any[] | null | undefined,
  viewerRole: "client" | "team" | "admin",
): AssigneeChip[] {
  if (viewerRole === "client") {
    if (!assignees || assignees.length === 0) return [];
    return [{ label: "Divan Team", initials: "DT", isTeamBrand: true }];
  }
  if (!assignees) return [];
  return assignees
    .map((a) => {
      const name: string =
        (typeof a === "string" ? a : a?.username || a?.email || a?.name) || "";
      if (!name) return null;
      const initials = name
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
      return { label: name, initials: initials || "?" };
    })
    .filter(Boolean) as AssigneeChip[];
}
