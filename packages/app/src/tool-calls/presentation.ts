import type { ToolCallDetail } from "@server/server/agent/agent-sdk-types";
import type { ToolCallDisplayInput } from "@/utils/tool-call-display";
import { buildToolCallDisplayModel } from "@/utils/tool-call-display";
import { extractToolCallFilePath } from "@/utils/extract-tool-call-file-path";
import {
  hasMeaningfulToolCallDetail,
  isPendingToolCallDetail,
} from "@/utils/tool-call-detail-state";
import { resolveToolCallIcon, type ToolCallIconComponent } from "@/utils/tool-call-icon";

type ToolCallStatus = "executing" | "running" | "completed" | "failed" | "canceled";

interface BuildToolCallPresentationInput {
  toolName: string;
  status: ToolCallStatus;
  error: unknown;
  detail?: ToolCallDetail;
  cwd?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolCallPresentation {
  displayName: string;
  summary?: string;
  errorText?: string;
  icon: ToolCallIconComponent;
  isLoadingDetails: boolean;
  hasDetails: boolean;
  canOpenDetails: boolean;
  openFilePath: string | null;
  isPlan: boolean;
}

function displayStatus(status: ToolCallStatus): ToolCallDisplayInput["status"] {
  return status === "executing" ? "running" : status;
}

function displayDetail(detail: ToolCallDetail | undefined): ToolCallDetail {
  return detail ?? { type: "unknown", input: null, output: null };
}

export function buildToolCallPresentation(
  input: BuildToolCallPresentationInput,
): ToolCallPresentation {
  const detailForDisplay = displayDetail(input.detail);
  const displayModel = buildToolCallDisplayModel({
    name: input.toolName,
    status: displayStatus(input.status),
    error: input.error ?? null,
    detail: detailForDisplay,
    metadata: input.metadata,
    cwd: input.cwd,
  });
  const isLoadingDetails = isPendingToolCallDetail({
    detail: input.detail,
    status: input.status,
    error: input.error,
  });
  const hasDetails = Boolean(input.error) || hasMeaningfulToolCallDetail(input.detail);

  return {
    displayName: displayModel.displayName,
    summary: displayModel.summary,
    errorText: displayModel.errorText,
    icon: resolveToolCallIcon(input.toolName, input.detail),
    isLoadingDetails,
    hasDetails,
    canOpenDetails: hasDetails || isLoadingDetails,
    openFilePath: extractToolCallFilePath(input.detail),
    isPlan: input.detail?.type === "plan",
  };
}
