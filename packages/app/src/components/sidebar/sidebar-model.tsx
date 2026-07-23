import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  sortSidebarProjects,
  useSidebarWorkspacesList,
  type SidebarWorkspaceEntry,
  type SidebarWorkspacesListResult,
} from "@/hooks/use-sidebar-workspaces-list";
import { useSidebarWorkspaceEntries } from "@/hooks/use-sidebar-workspace-entries";
import type { StatusGroup } from "@/hooks/sidebar-status-view-model";
import { usePinnedSidebarKeys, type PinnedSidebarGroups } from "@/hooks/use-sidebar-pins";
import { useAppSettings } from "@/hooks/use-settings";
import { useSidebarCollapsedSectionsStore } from "@/stores/sidebar-collapsed-sections-store";
import { useSidebarViewStore, type SidebarGroupMode } from "@/stores/sidebar-view-store";
import type { SidebarShortcutModel } from "@/utils/sidebar-shortcuts";
import { buildSidebarProjection } from "./sidebar-projection";
import { resolveSidebarWorkspacePrimaryLabel } from "./sidebar-workspace-title";

interface SidebarModel extends SidebarWorkspacesListResult {
  workspaceEntriesByKey: ReadonlyMap<string, SidebarWorkspaceEntry>;
  groupMode: SidebarGroupMode;
  statusGroups: StatusGroup[];
  pinnedGroups: PinnedSidebarGroups;
  collapsedProjectKeys: ReadonlySet<string>;
  toggleProjectCollapsed: (projectKey: string) => void;
  shortcutModel: SidebarShortcutModel;
}

const SidebarModelContext = createContext<SidebarModel | null>(null);
const EMPTY_WORKSPACE_ENTRIES = new Map<string, SidebarWorkspaceEntry>();
const EMPTY_SORT_LABELS: ReadonlyMap<string, string> = new Map();
const EMPTY_SORT_ACTIVITY: ReadonlyMap<string, number> = new Map();

export function SidebarModelProvider({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  const list = useSidebarWorkspacesList();
  const groupMode = useSidebarViewStore((state) => state.groupMode);
  const sortMode = useSidebarViewStore((state) => state.sortMode);
  const {
    settings: { workspaceTitleSource },
  } = useAppSettings();
  const collapsedProjectKeys = useSidebarCollapsedSectionsStore(
    (state) => state.collapsedProjectKeys,
  );
  const collapsedStatusGroupKeys = useSidebarCollapsedSectionsStore(
    (state) => state.collapsedStatusGroupKeys,
  );
  const pinnedCollapsed = useSidebarCollapsedSectionsStore((state) => state.collapsedPinned);
  const toggleProjectCollapsed = useSidebarCollapsedSectionsStore(
    (state) => state.toggleProjectCollapsed,
  );
  const isStatusMode = groupMode === "status";
  const workspaceEntriesByKey = useSidebarWorkspaceEntries(
    list.workspacePlacements,
    active !== false || isStatusMode,
  );
  const projectionWorkspaceEntriesByKey = isStatusMode
    ? workspaceEntriesByKey
    : EMPTY_WORKSPACE_ENTRIES;

  // The "Sort by" preference only applies to project grouping; status mode has its own ordering.
  // Ordering keys are resolved from the workspace entries so Name matches the rendered label
  // (branch vs title) and Activity uses the effective, agent-activity-aware status timestamp.
  const shouldSort = groupMode === "project" && sortMode !== "manual";
  const sortKeys = useMemo(() => {
    if (!shouldSort) {
      return { labelByKey: EMPTY_SORT_LABELS, activityByKey: EMPTY_SORT_ACTIVITY };
    }
    const labelByKey = new Map<string, string>();
    const activityByKey = new Map<string, number>();
    for (const [workspaceKey, entry] of workspaceEntriesByKey) {
      labelByKey.set(
        workspaceKey,
        resolveSidebarWorkspacePrimaryLabel({ workspace: entry, workspaceTitleSource }),
      );
      activityByKey.set(workspaceKey, entry.statusEnteredAt?.getTime() ?? 0);
    }
    return { labelByKey, activityByKey };
  }, [shouldSort, workspaceEntriesByKey, workspaceTitleSource]);

  const sortedProjects = useMemo(
    () =>
      sortSidebarProjects({
        projects: list.projects,
        sortMode,
        labelByKey: sortKeys.labelByKey,
        activityByKey: sortKeys.activityByKey,
      }),
    [list.projects, sortMode, sortKeys],
  );

  const pinnedKeys = usePinnedSidebarKeys(sortedProjects);
  const projection = useMemo(
    () =>
      buildSidebarProjection({
        projects: sortedProjects,
        pinnedKeys,
        workspaceEntriesByKey: projectionWorkspaceEntriesByKey,
        projectNamesByKey: list.projectNamesByKey,
        groupMode,
        pinnedCollapsed,
        collapsedProjectKeys,
        collapsedStatusGroupKeys,
      }),
    [
      collapsedProjectKeys,
      collapsedStatusGroupKeys,
      groupMode,
      list.projectNamesByKey,
      sortedProjects,
      pinnedCollapsed,
      pinnedKeys,
      projectionWorkspaceEntriesByKey,
    ],
  );
  const value = useMemo(
    () => ({
      ...list,
      projects: sortedProjects,
      workspaceEntriesByKey,
      groupMode,
      statusGroups: projection.statusGroups,
      pinnedGroups: projection.pinnedGroups,
      collapsedProjectKeys,
      toggleProjectCollapsed,
      shortcutModel: projection.shortcutModel,
    }),
    [
      collapsedProjectKeys,
      groupMode,
      list,
      projection,
      sortedProjects,
      toggleProjectCollapsed,
      workspaceEntriesByKey,
    ],
  );

  return <SidebarModelContext.Provider value={value}>{children}</SidebarModelContext.Provider>;
}

export function useSidebarModel(): SidebarModel {
  const model = useContext(SidebarModelContext);
  if (!model) throw new Error("SidebarModelProvider is required");
  return model;
}
