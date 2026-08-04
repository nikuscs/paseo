import { useCallback, useMemo } from "react";
import {
  useAppSettings,
  type RecentlyDoneWindowMinutes,
  type SidebarWorkspaceTrailing,
  type WorkspaceTitleSource,
} from "@/hooks/use-settings";
import { useSidebarViewStore, type SidebarGroupMode } from "@/stores/sidebar-view-store";
import { DEFAULT_SIDEBAR_ROW_ITEMS, type SidebarRowItem, type SidebarRowItems } from "./row-items";

/** The trailing slot holds one thing, so these are a choice rather than toggles. */
export type SidebarTrailingChoice = Exclude<SidebarWorkspaceTrailing, "none">;

export interface SidebarDisplayPreferences {
  grouping: SidebarGroupMode;
  setGrouping: (mode: SidebarGroupMode) => void;
  titleSource: WorkspaceTitleSource;
  setTitleSource: (source: WorkspaceTitleSource) => void;
  rowItems: SidebarRowItems;
  toggleRowItem: (item: SidebarRowItem) => void;
  trailing: SidebarWorkspaceTrailing;
  /** Picking the choice that is already showing clears the slot. */
  toggleTrailing: (choice: SidebarTrailingChoice) => void;
  compactRows: boolean;
  toggleCompactRows: () => void;
  showNewWorkspaceRow: boolean;
  toggleNewWorkspaceRow: () => void;
  recentlyDoneWindowMinutes: RecentlyDoneWindowMinutes;
  setRecentlyDoneWindowMinutes: (value: RecentlyDoneWindowMinutes) => void;
  hostFilters: readonly string[];
  toggleHostFilter: (serverId: string) => void;
  clearHostFilters: () => void;
}

/**
 * Every decision the sidebar's display-preferences menu can make, behind one interface.
 *
 * Grouping and host filters live in a local zustand store while the title source and row items
 * are synced app settings — a split that exists for good reasons (a filter is transient view
 * state; a preference follows you) and that the menu has no business knowing about. Callers ask
 * this for a value and set it; where it lands is this module's problem.
 */
export function useSidebarDisplayPreferences(): SidebarDisplayPreferences {
  const grouping = useSidebarViewStore((state) => state.groupMode);
  const setGrouping = useSidebarViewStore((state) => state.setGroupMode);
  const hostFilters = useSidebarViewStore((state) => state.hostFilters);
  const toggleHostFilter = useSidebarViewStore((state) => state.toggleHostFilter);
  const clearHostFilters = useSidebarViewStore((state) => state.clearHostFilters);

  const {
    settings: {
      workspaceTitleSource,
      sidebarWorkspaceTrailing,
      sidebarRowItems,
      compactSidebarRows,
      showNewWorkspaceRow,
      recentlyDoneWindowMinutes,
    },
    updateSettings,
  } = useAppSettings();

  const setTitleSource = useCallback(
    (source: WorkspaceTitleSource) => {
      void updateSettings({ workspaceTitleSource: source });
    },
    [updateSettings],
  );

  const toggleRowItem = useCallback(
    (item: SidebarRowItem) => {
      void updateSettings({
        sidebarRowItems: { [item]: !sidebarRowItems[item] },
      });
    },
    [updateSettings, sidebarRowItems],
  );

  const toggleTrailing = useCallback(
    (choice: SidebarTrailingChoice) => {
      void updateSettings({
        sidebarWorkspaceTrailing: sidebarWorkspaceTrailing === choice ? "none" : choice,
      });
    },
    [updateSettings, sidebarWorkspaceTrailing],
  );
  const toggleCompactRows = useCallback(() => {
    void updateSettings({ compactSidebarRows: !compactSidebarRows });
  }, [compactSidebarRows, updateSettings]);
  const toggleNewWorkspaceRow = useCallback(() => {
    void updateSettings({ showNewWorkspaceRow: !showNewWorkspaceRow });
  }, [showNewWorkspaceRow, updateSettings]);
  const setRecentlyDoneWindowMinutes = useCallback(
    (value: RecentlyDoneWindowMinutes) => {
      void updateSettings({ recentlyDoneWindowMinutes: value });
    },
    [updateSettings],
  );

  return useMemo(
    () => ({
      grouping,
      setGrouping,
      titleSource: workspaceTitleSource,
      setTitleSource,
      rowItems: sidebarRowItems,
      toggleRowItem,
      trailing: sidebarWorkspaceTrailing,
      toggleTrailing,
      compactRows: compactSidebarRows,
      toggleCompactRows,
      showNewWorkspaceRow,
      toggleNewWorkspaceRow,
      recentlyDoneWindowMinutes,
      setRecentlyDoneWindowMinutes,
      hostFilters,
      toggleHostFilter,
      clearHostFilters,
    }),
    [
      grouping,
      setGrouping,
      workspaceTitleSource,
      setTitleSource,
      sidebarRowItems,
      toggleRowItem,
      sidebarWorkspaceTrailing,
      toggleTrailing,
      compactSidebarRows,
      toggleCompactRows,
      showNewWorkspaceRow,
      toggleNewWorkspaceRow,
      recentlyDoneWindowMinutes,
      setRecentlyDoneWindowMinutes,
      hostFilters,
      toggleHostFilter,
      clearHostFilters,
    ],
  );
}

/**
 * Just the row items, for the row renderers. They re-render per workspace, so they subscribe to
 * the one field they use rather than to every preference in the menu.
 */
export function useSidebarRowItems(): SidebarRowItems {
  const {
    settings: { sidebarRowItems },
  } = useAppSettings();
  return sidebarRowItems ?? DEFAULT_SIDEBAR_ROW_ITEMS;
}

export function useCompactSidebarRows(): boolean {
  return useAppSettings().settings.compactSidebarRows;
}

export function useShowNewWorkspaceRow(): boolean {
  return useAppSettings().settings.showNewWorkspaceRow;
}
