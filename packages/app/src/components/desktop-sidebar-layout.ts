import type { SidebarSide } from "@/components/sidebar-sides";
import { SETTINGS_DESKTOP_SPLIT_MIN_WIDTH } from "@/constants/layout";
import {
  MAX_EXPLORER_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_EXPLORER_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/stores/panel-store";

export const MIN_DESKTOP_CENTER_WIDTH = 400;

export function resolveDesktopSidebarVisibility(input: {
  chromeEnabled: boolean;
  isCompactLayout: boolean;
  isMounted: boolean;
  isOpen: boolean;
  canShare: boolean;
}): boolean {
  return (
    input.chromeEnabled &&
    !input.isCompactLayout &&
    input.isMounted &&
    input.isOpen &&
    input.canShare
  );
}

export function resolveDesktopAppChromeLayout(input: {
  desktopSidebarRendered: boolean;
  hasTopLeftWindowControls: boolean;
  sidebarControlsEnabled: boolean;
  /** Defaults to the left, which is where the sidebar sits unless the user moved it. */
  agentListSide?: SidebarSide;
}) {
  // Only the pane against the window's left edge can own the traffic lights. Park the sidebar on
  // the right and that pane is the content.
  const sidebarOwnsTopLeft =
    input.desktopSidebarRendered &&
    input.hasTopLeftWindowControls &&
    input.agentListSide !== "right";
  let sidebarToggleOwner: "none" | "window" | "content" = "none";
  if (input.sidebarControlsEnabled) {
    sidebarToggleOwner = input.hasTopLeftWindowControls ? "window" : "content";
  }
  return {
    sidebarCorners: sidebarOwnsTopLeft ? ("top-left" as const) : ("none" as const),
    contentCorners: sidebarOwnsTopLeft ? ("top-right" as const) : ("both" as const),
    sidebarToggleOwner,
  };
}

function resolveDesktopPanelWidth(input: {
  requestedWidth: number;
  viewportWidth: number;
  minimumWidth: number;
  maximumWidth: number;
}): number {
  "worklet";
  const maximumVisibleWidth = Math.max(
    input.minimumWidth,
    Math.min(input.maximumWidth, input.viewportWidth - MIN_DESKTOP_CENTER_WIDTH),
  );
  return Math.max(input.minimumWidth, Math.min(maximumVisibleWidth, input.requestedWidth));
}

export function resolveDesktopSidebarWidth(input: {
  requestedWidth: number;
  viewportWidth: number;
}): number {
  "worklet";
  return resolveDesktopPanelWidth({
    ...input,
    minimumWidth: MIN_SIDEBAR_WIDTH,
    maximumWidth: MAX_SIDEBAR_WIDTH,
  });
}

export function resolveDesktopExplorerWidth(input: {
  requestedWidth: number;
  viewportWidth: number;
}): number {
  "worklet";
  return resolveDesktopPanelWidth({
    ...input,
    minimumWidth: MIN_EXPLORER_SIDEBAR_WIDTH,
    maximumWidth: MAX_EXPLORER_SIDEBAR_WIDTH,
  });
}

export function resolveDesktopAppContentMinimum(input: {
  isSettingsRoute: boolean;
  isWorkspaceExplorerOpen: boolean;
  requestedExplorerWidth: number;
  viewportWidth: number;
}): number {
  const workspaceMinimum = input.isWorkspaceExplorerOpen
    ? MIN_DESKTOP_CENTER_WIDTH +
      resolveDesktopExplorerWidth({
        requestedWidth: input.requestedExplorerWidth,
        viewportWidth: input.viewportWidth,
      })
    : 0;
  return Math.max(input.isSettingsRoute ? SETTINGS_DESKTOP_SPLIT_MIN_WIDTH : 0, workspaceMinimum);
}

export function canDesktopAppSidebarShare(input: {
  contentMinimumWidth: number;
  requestedSidebarWidth: number;
  viewportWidth: number;
}): boolean {
  return (
    input.viewportWidth -
      resolveDesktopSidebarWidth({
        requestedWidth: input.requestedSidebarWidth,
        viewportWidth: input.viewportWidth,
      }) >=
    input.contentMinimumWidth
  );
}
