import type { SidebarRowDensity } from "@/components/sidebar/display-preferences/row-density";
import type { Theme } from "@/styles/theme";

interface SidebarRowBox {
  minHeight?: number;
  paddingVertical?: number;
  marginBottom?: number;
}

interface SidebarRowMetrics {
  /** Laid over a row's comfortable box. */
  row: SidebarRowBox;
  /** Laid over a workspace row that stacks its title line over a meta row. */
  stackedRow: SidebarRowBox & { gap?: number };
  /** Laid over the 24pt controls a project row carries, so they never set its height. */
  control: { height?: number };
  /** The row's vertical padding, for overlays that sit on its first line. */
  paddingVertical: number;
  /** The space under an expanded project or status group. */
  groupGap: number;
}

/**
 * The geometry each sidebar row density lays over the comfortable one.
 *
 * Every sidebar row that a workspace or project can occupy declares the same comfortable
 * geometry inline in its own stylesheet, so comfortable lays nothing over it. The steps down from
 * it are shared so the surfaces cannot drift apart into slightly different compacts or denses.
 *
 * Dense keeps the text and icon sizes and takes its room out of everything around them: no
 * padding, a floor at the 20pt title line, and controls cut to that line. It keeps the 2pt gutter
 * under every row, the status group header's included, so a hovered row never merges into the
 * selected one beside it.
 */
export function sidebarRowMetrics(theme: Theme, density: SidebarRowDensity): SidebarRowMetrics {
  switch (density) {
    case "comfortable":
      return {
        row: {},
        stackedRow: {},
        control: {},
        paddingVertical: theme.spacing[2],
        groupGap: theme.spacing[3],
      };
    case "compact": {
      const row = { minHeight: 28, paddingVertical: theme.spacing[1] };
      return {
        row,
        stackedRow: row,
        control: {},
        paddingVertical: theme.spacing[1],
        groupGap: theme.spacing[3],
      };
    }
    case "dense": {
      const row = {
        minHeight: 20,
        paddingVertical: theme.spacing[0],
        marginBottom: theme.spacing[0.5],
      };
      return {
        row,
        stackedRow: { ...row, gap: theme.spacing[0.5] },
        control: { height: 20 },
        paddingVertical: theme.spacing[0],
        groupGap: theme.spacing[1],
      };
    }
  }
}
