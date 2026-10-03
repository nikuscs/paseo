import type { WorkspaceTab, WorkspaceTabTarget } from "@/workspace-tabs/model";

export interface WorkspaceTabDescriptor extends Pick<WorkspaceTab, "pinned"> {
  key: string;
  tabId: string;
  kind: WorkspaceTabTarget["kind"];
  target: WorkspaceTabTarget;
  state?: import("@getpaseo/protocol/agent-types").JsonValue;
}
