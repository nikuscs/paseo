import type { SidebarResizeEdge } from "@/components/sidebar-resize-handle-layout";
import type { AppSettings } from "@/hooks/use-settings";

/**
 * Which side of the desktop window each sidebar sits on.
 *
 * One setting drives both: the workspace sidebar picks a side and the file explorer takes the
 * other. They cannot share a side — the middle would have nothing left — so a single value is the
 * only representable state.
 *
 * Compact layouts are not affected. There the two sidebars are one gesture with a single
 * normalized position (see docs/mobile-panels.md), and swapping them means swapping which way you
 * swipe, which is muscle memory rather than a preference.
 */
export type SidebarSide = "left" | "right";

export interface SidebarSides {
  agentList: SidebarSide;
  explorer: SidebarSide;
}

export function resolveSidebarSides(agentListSide: AppSettings["agentListSide"]): SidebarSides {
  return agentListSide === "right"
    ? { agentList: "right", explorer: "left" }
    : { agentList: "left", explorer: "right" };
}

/** The resize grip lives on the edge facing the content, which is the side's opposite. */
export function resolveSidebarResizeEdge(side: SidebarSide): SidebarResizeEdge {
  return side === "left" ? "right" : "left";
}

/**
 * Sign applied to a drag's horizontal translation. Dragging away from the window edge widens the
 * sidebar, so a right-hand sidebar reads the drag backwards.
 */
export function resolveSidebarResizeDirection(side: SidebarSide): 1 | -1 {
  return side === "left" ? 1 : -1;
}
