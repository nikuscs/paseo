import { describe, expect, test, vi } from "vitest";
import { openWorkspaceFileFromExplorer } from "./workspace-file-open-command";

describe("openWorkspaceFileFromExplorer", () => {
  test("opens a search match with its target line", () => {
    const showMobileAgent = vi.fn();
    const openWorkspaceTabFocused = vi.fn(() => "tab-file");
    const focusWorkspaceTab = vi.fn();

    openWorkspaceFileFromExplorer({
      filePath: "src/search.ts",
      lineStart: 42,
      lineEnd: 42,
      persistenceKey: "server:workspace",
      showMobileAgent,
      openWorkspaceTabFocused,
      focusWorkspaceTab,
    });

    expect(showMobileAgent).toHaveBeenCalledTimes(1);
    expect(openWorkspaceTabFocused).toHaveBeenCalledWith("server:workspace", {
      kind: "file",
      path: "src/search.ts",
      lineStart: 42,
      lineEnd: 42,
    });
    expect(focusWorkspaceTab).toHaveBeenCalledWith("server:workspace", "tab-file");
  });
});
