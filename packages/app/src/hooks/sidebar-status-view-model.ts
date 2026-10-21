import type { TFunction } from "i18next";
import { STATUS_BUCKET_ORDER } from "@/utils/sidebar-agent-state";
import type { SidebarWorkspaceEntry } from "@/hooks/sidebar-workspaces-view-model";

export type StatusBucket = SidebarWorkspaceEntry["statusBucket"];

export { STATUS_BUCKET_ORDER };

const STATUS_BUCKET_LABEL_KEYS = {
  needs_input: "sidebar.statusBucket.needsInput",
  failed: "sidebar.statusBucket.failed",
  attention: "sidebar.statusBucket.readyToReview",
  running: "sidebar.statusBucket.working",
  done: "sidebar.statusBucket.done",
} as const satisfies Record<StatusBucket, string>;

export function getStatusBucketLabel(bucket: StatusBucket, t: TFunction): string {
  return t(STATUS_BUCKET_LABEL_KEYS[bucket]);
}

/**
 * A status bucket, plus the one group the sidebar makes that no bucket stands for: workspaces
 * that finished inside the user's "Recently done" window. It is a slice of `done` rather than a
 * bucket of its own because nothing upstream of the sidebar knows about the window.
 */
export type StatusGroupKey = StatusBucket | "recently_done";

export const STATUS_GROUP_ORDER: readonly StatusGroupKey[] = [
  "needs_input",
  "failed",
  "attention",
  "running",
  "recently_done",
  "done",
] as const;

function getStatusGroupLabel(key: StatusGroupKey, t: TFunction): string {
  return key === "recently_done"
    ? t("sidebar.display.recentlyDone.label")
    : getStatusBucketLabel(key, t);
}

export interface StatusGroup {
  key: StatusGroupKey;
  label: string;
  rows: SidebarWorkspaceEntry[];
}

/**
 * `recentlyDoneSince` is the wall-clock instant a workspace must have finished after to keep its
 * own group; `null` is the window switched off. A single timestamp rather than a duration plus a
 * clock, so the caller owns the one thing that has to change over time and this stays pure.
 */
export function buildStatusGroups(
  workspaces: SidebarWorkspaceEntry[],
  projectNamesByViewKey: Map<string, string>,
  t: TFunction,
  recentlyDoneSince: number | null = null,
): StatusGroup[] {
  const rowsByKey = new Map<StatusGroupKey, SidebarWorkspaceEntry[]>();

  for (const ws of workspaces) {
    const key = resolveStatusGroupKey(ws, recentlyDoneSince);
    let rows = rowsByKey.get(key);
    if (!rows) {
      rows = [];
      rowsByKey.set(key, rows);
    }
    rows.push(ws);
  }

  const groups: StatusGroup[] = [];

  for (const key of STATUS_GROUP_ORDER) {
    const rows = rowsByKey.get(key);
    if (!rows || rows.length === 0) continue;

    rows.sort((a, b) => compareStatusRows(a, b, projectNamesByViewKey));
    groups.push({ key, label: getStatusGroupLabel(key, t), rows });
  }

  return groups;
}

/**
 * `statusEnteredAt` is the host's clock and `recentlyDoneSince` is this device's, so a host
 * running ahead can hand back a finish time in the future. That reads as "just now", which is
 * why the test has no upper bound: skew moves a row into the group early rather than keeping it
 * out for the length of the skew. A host running behind ages rows out sooner, which is the
 * grouping the sidebar already has today.
 */
function resolveStatusGroupKey(
  workspace: SidebarWorkspaceEntry,
  recentlyDoneSince: number | null,
): StatusGroupKey {
  if (workspace.statusBucket !== "done" || recentlyDoneSince === null) {
    return workspace.statusBucket;
  }
  const enteredAt = workspace.statusEnteredAt?.getTime();
  if (enteredAt === undefined) return "done";
  return enteredAt >= recentlyDoneSince ? "recently_done" : "done";
}

function compareStatusRows(
  a: SidebarWorkspaceEntry,
  b: SidebarWorkspaceEntry,
  projectNamesByViewKey: Map<string, string>,
): number {
  const aTime = a.statusEnteredAt?.getTime() ?? null;
  const bTime = b.statusEnteredAt?.getTime() ?? null;

  if (aTime !== null && bTime !== null) {
    if (aTime !== bTime) return bTime - aTime;
  } else if (aTime !== null) {
    return -1;
  } else if (bTime !== null) {
    return 1;
  }

  const aProject = projectNamesByViewKey.get(a.projectViewKey) ?? "";
  const bProject = projectNamesByViewKey.get(b.projectViewKey) ?? "";
  const projectCmp = aProject.localeCompare(bProject);
  if (projectCmp !== 0) return projectCmp;

  const nameCmp = a.name.localeCompare(b.name);
  if (nameCmp !== 0) return nameCmp;

  return a.workspaceKey.localeCompare(b.workspaceKey);
}

export function buildStatusShortcutIndex(groups: StatusGroup[]): Map<string, number> {
  const index = new Map<string, number>();
  let shortcutNumber = 1;
  for (const group of groups) {
    for (const row of group.rows) {
      if (shortcutNumber > 9) return index;
      index.set(row.workspaceKey, shortcutNumber);
      shortcutNumber += 1;
    }
  }
  return index;
}
