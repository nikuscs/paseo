import { test, expect } from "./fixtures";
import {
  composerLocator,
  expectComposerVisible,
  seedCodexDraftComposerPreferences,
} from "./helpers/composer";
import { clickNewChat } from "./helpers/launcher";

test.describe("Mobile composer controls", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps model and thinking direct while moving secondary controls into preferences", async ({
    page,
    withWorkspace,
  }) => {
    test.setTimeout(60_000);

    const workspace = await withWorkspace({ prefix: "mobile-composer-controls-" });
    await workspace.navigateTo();
    await seedCodexDraftComposerPreferences(page);
    await clickNewChat(page);
    await expectComposerVisible(page);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /user-scalable=no/,
    );

    const modelTrigger = page.getByTestId("combined-model-selector").filter({ visible: true });
    const thinkingTrigger = page.getByTestId("agent-thinking-selector").filter({ visible: true });
    const preferencesTrigger = page.getByTestId("agent-preferences-button").filter({
      visible: true,
    });

    await expect(modelTrigger).toBeVisible();
    await expect(modelTrigger).toHaveText("");
    await expect(thinkingTrigger).toBeVisible();
    await expect(thinkingTrigger).toHaveText("");
    await expect(preferencesTrigger).toBeVisible();
    await expect(async () => {
      const thinkingBox = await thinkingTrigger.boundingBox();
      const preferencesBox = await preferencesTrigger.boundingBox();
      expect(thinkingBox).not.toBeNull();
      expect(preferencesBox).not.toBeNull();
      expect(preferencesBox?.x).toBeGreaterThan(thinkingBox?.x ?? 0);
    }).toPass();

    await preferencesTrigger.click();
    await expect(page.getByTestId("agent-preferences-sheet")).toBeVisible();
    await expect(page.getByTestId("agent-preferences-mode")).toBeVisible();
    await expect(page.getByTestId("agent-feature-fast_mode")).toBeVisible();
    await expect(page.getByTestId("agent-feature-plan_mode")).toBeVisible();
    await expect(page.getByText("Context window", { exact: true })).toBeVisible();
    await expect(page.getByText("Voice mode", { exact: true })).toBeVisible();
    await expect(page.getByTestId("combined-model-selector")).toHaveCount(1);
    await expect(page.getByTestId("agent-thinking-selector")).toHaveCount(1);

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("agent-preferences-sheet")).not.toBeVisible();

    await modelTrigger.click();
    await expect(page.getByText("Select model", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();

    await thinkingTrigger.click();
    await expect(page.getByRole("button", { name: "low" })).toBeVisible();
    await expect(page.getByRole("button", { name: "medium" })).toBeVisible();
  });

  test("Enter inserts a newline in the mobile web composer", async ({ page, withWorkspace }) => {
    test.setTimeout(60_000);

    const workspace = await withWorkspace({ prefix: "mobile-composer-enter-" });
    await workspace.navigateTo();
    await clickNewChat(page);
    await expectComposerVisible(page);

    const composer = composerLocator(page);
    await composer.fill("hello");
    await composer.press("Enter");
    await composer.pressSequentially("world");

    await expect(composer).toHaveValue("hello\nworld");
  });
});
