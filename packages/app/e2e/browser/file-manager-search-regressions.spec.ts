import { chmod } from "node:fs/promises";
import { expect } from "@playwright/test";
import { test } from "../support/fixtures";
import { gotoWorkspace } from "../support/helpers/launcher";
import { seedWorkspace, type SeededWorkspace } from "../support/helpers/seed-client";
import { ensureSidePanel, openFilesPanel } from "../support/helpers/workspace-tabs";

let workspace: SeededWorkspace;

test.beforeAll(async () => {
  const lines = Array.from({ length: 220 }, (_, index) =>
    index === 159
      ? "export const uniqueSearchNeedle = true;"
      : `export const line${index + 1} = true;`,
  );
  workspace = await seedWorkspace({
    repoPrefix: "file-manager-search-regressions-",
    repo: { files: [{ path: "src/search.ts", content: `${lines.join("\n")}\n` }] },
  });
});

test.afterAll(async () => {
  await chmod(workspace.repoPath, 0o755).catch(() => undefined);
  await workspace?.cleanup();
});

test("search stays available while the initial tree listing is errored and retried", async ({
  page,
}) => {
  await gotoWorkspace(page, workspace.workspaceId);
  await chmod(workspace.repoPath, 0o000);

  const sidePanel = await ensureSidePanel(page);
  if ((await sidePanel.getByTestId("workspace-new-tab-panel").count()) === 0) {
    await sidePanel.getByTestId("workspace-new-tab-button").click();
  }
  await sidePanel.getByTestId("workspace-new-tab-files").click();

  const searchToggle = sidePanel.getByTestId("files-search-toggle");
  await expect(searchToggle).toBeVisible({ timeout: 30_000 });
  await chmod(workspace.repoPath, 0o755);
  await sidePanel.getByText("Retry", { exact: true }).click();
  await searchToggle.click();
  await expect(sidePanel.getByTestId("file-search-pane")).toBeVisible();
  await expect(sidePanel.getByTestId("files-sort-trigger")).toBeHidden();
});

test("Explorer file clicks retarget the Files tab instead of opening a main-pane tab", async ({
  page,
}) => {
  await gotoWorkspace(page, workspace.workspaceId);
  await openFilesPanel(page);

  const sidePanel = await ensureSidePanel(page);
  const mainPane = page.getByTestId("workspace-pane-main").filter({ visible: true }).first();
  const mainTabCount = await mainPane.locator('[data-testid^="workspace-tab-"]').count();
  const tree = sidePanel.getByTestId("file-explorer-tree-scroll");
  await tree.getByText("src", { exact: true }).click();
  await tree.getByText("search.ts", { exact: true }).click();

  await expect(sidePanel.getByTestId("workspace-tab-files")).toHaveCount(0);
  await expect(sidePanel.getByTestId("workspace-tab-file_src/search.ts")).toBeVisible();
  await expect(sidePanel.getByTestId("file-tree-rail")).toBeVisible();
  await expect(mainPane.locator('[data-testid^="workspace-tab-"]')).toHaveCount(mainTabCount);
  await expect(mainPane.getByTestId("workspace-tab-file_src/search.ts")).toHaveCount(0);
});

test("opening the same search match again recenters the file", async ({ page }) => {
  await gotoWorkspace(page, workspace.workspaceId);
  await openFilesPanel(page);
  await page.getByTestId("files-search-toggle").filter({ visible: true }).click();
  await page.getByTestId("files-search-input").filter({ visible: true }).fill("uniqueSearchNeedle");

  const match = page.getByRole("button", { name: "src/search.ts, line 160" });
  await expect(match).toBeVisible({ timeout: 30_000 });
  await match.click();

  const editor = page.getByTestId("file-source-editor").filter({ visible: true });
  const scroller = editor.locator(".cm-scroller");
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await scroller.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(0);

  await page.getByTestId("files-search-toggle").filter({ visible: true }).click();
  await page.getByTestId("files-search-input").filter({ visible: true }).fill("uniqueSearchNeedle");
  await expect(match).toBeVisible({ timeout: 30_000 });
  await match.click();

  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});
