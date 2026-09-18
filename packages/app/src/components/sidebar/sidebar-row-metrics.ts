import type { Theme } from "@/styles/theme";

/**
 * The compact half of the sidebar row density.
 *
 * Every sidebar row that a workspace or project can occupy declares the same comfortable
 * geometry inline in its own stylesheet; this is the one step down from it, shared so the
 * surfaces cannot drift apart into two slightly different compacts.
 */
export function compactSidebarRowMetrics(theme: Theme): {
  minHeight: number;
  paddingVertical: number;
} {
  return { minHeight: 28, paddingVertical: theme.spacing[1] };
}
