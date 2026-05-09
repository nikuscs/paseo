import { describe, expect, it, vi } from "vitest";

const iconMocks = vi.hoisted(() => ({
  Bot: () => null,
  Brain: () => null,
  Eye: () => null,
  MicVocal: () => null,
  Pencil: () => null,
  Search: () => null,
  Sparkles: () => null,
  SquareTerminal: () => null,
  Wrench: () => null,
}));

vi.mock("lucide-react-native", () => iconMocks);

import { buildToolCallPresentation } from "./presentation";

describe("tool-call presentation", () => {
  it("builds badge, detail, icon, and file-open policy in one model", () => {
    const presentation = buildToolCallPresentation({
      toolName: "read_file",
      status: "completed",
      error: null,
      cwd: "/tmp/repo",
      detail: {
        type: "read",
        filePath: "/tmp/repo/src/index.ts",
        content: "console.log('hi');",
      },
    });

    expect(presentation).toMatchObject({
      displayName: "Read",
      summary: "src/index.ts",
      icon: iconMocks.Eye,
      isLoadingDetails: false,
      hasDetails: true,
      canOpenDetails: true,
      openFilePath: "/tmp/repo/src/index.ts",
      isPlan: false,
    });
  });

  it("marks running calls without meaningful detail as loading details", () => {
    const presentation = buildToolCallPresentation({
      toolName: "exec_command",
      status: "running",
      error: null,
      detail: {
        type: "unknown",
        input: {},
        output: null,
      },
    });

    expect(presentation).toMatchObject({
      displayName: "Exec Command",
      icon: iconMocks.Wrench,
      isLoadingDetails: true,
      hasDetails: false,
      canOpenDetails: true,
      openFilePath: null,
      isPlan: false,
    });
  });

  it("keeps plan calls out of the expandable badge path", () => {
    const presentation = buildToolCallPresentation({
      toolName: "ExitPlanMode",
      status: "completed",
      error: null,
      detail: {
        type: "plan",
        text: "1. Do the thing",
      },
    });

    expect(presentation.isPlan).toBe(true);
    expect(presentation.icon).toBe(iconMocks.Brain);
  });
});
