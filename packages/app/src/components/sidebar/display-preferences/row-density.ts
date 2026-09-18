/**
 * How much vertical room a sidebar project or workspace row takes.
 *
 * A density rather than a row item: it changes the geometry of every row at once instead of
 * adding or removing a fact from one, so it cannot live in the `sidebarRowItems` record.
 *
 * Pure on purpose, like `row-items.ts` and `checks-display.ts`: `hooks/use-settings/storage.ts`
 * validates the persisted value through `parseSidebarRowDensity` rather than growing its own copy
 * of the value list.
 */

export const SIDEBAR_ROW_DENSITIES = ["comfortable", "compact"] as const;

export type SidebarRowDensity = (typeof SIDEBAR_ROW_DENSITIES)[number];

export const DEFAULT_SIDEBAR_ROW_DENSITY: SidebarRowDensity = "comfortable";

export function parseSidebarRowDensity(value: unknown): SidebarRowDensity {
  if (typeof value !== "string") {
    return DEFAULT_SIDEBAR_ROW_DENSITY;
  }
  return (SIDEBAR_ROW_DENSITIES as readonly string[]).includes(value)
    ? (value as SidebarRowDensity)
    : DEFAULT_SIDEBAR_ROW_DENSITY;
}
