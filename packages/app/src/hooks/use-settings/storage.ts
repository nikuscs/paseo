import { isSyntaxThemeId, type SyntaxThemeId } from "@getpaseo/highlight";
import type { ActiveTurnBehavior } from "@getpaseo/protocol/messages";
import type { QueryClient } from "@tanstack/react-query";
import type { DesktopSettings } from "@/desktop/settings/desktop-settings";
import type { AppLanguage } from "@/i18n/locales";
import {
  DEFAULT_SIDEBAR_CHECKS_DISPLAY,
  type SidebarChecksDisplay,
} from "@/components/sidebar/display-preferences/checks-display";
import {
  DEFAULT_SIDEBAR_ROW_ITEMS,
  isChecksHiddenByLegacyRowItem,
  type SidebarRowItems,
} from "@/components/sidebar/display-preferences/row-items";
import { isNative } from "@/constants/platform";
import {
  FONT_SIZE,
  PLUGIN_THEME_PREFERENCE,
  THEME_OPTIONS,
  type ThemePreference,
} from "@/styles/theme";
import { z } from "zod";
import { APP_SETTINGS_KEY, LEGACY_SETTINGS_KEY } from "./keys";
import { migrateAppSettings } from "./migrations";

export { APP_SETTINGS_KEY } from "./keys";
export const APP_SETTINGS_QUERY_KEY = ["app-settings"];

export type SendBehavior = ActiveTurnBehavior | "queue";
export type ReleaseChannel = "stable" | "beta";
export type ServiceUrlBehavior = "ask" | "in-app" | "external";
export type WorkspaceTitleSource = "title" | "branch";
export type PullRequestOpenLocation = "main" | "side" | "explorer";
/** What a sidebar workspace row shows in the space to the right of its title. */
export type SidebarWorkspaceTrailing = "diff" | "timestamp" | "none";
export type ToolCallDetailLevel = "overview" | "detailed";

const ThemePreferenceSchema = z.enum([
  ...THEME_OPTIONS.map((option) => option.name),
  PLUGIN_THEME_PREFERENCE,
]);
/** Where the theme picker lands when the persisted preference cannot be honoured. */
export const DEFAULT_THEME_PREFERENCE = "auto" satisfies ThemePreference;
export const DEFAULT_TERMINAL_SCROLLBACK_LINES = 10_000;
export const MIN_TERMINAL_SCROLLBACK_LINES = 0;
export const MAX_TERMINAL_SCROLLBACK_LINES = 1_000_000;
export function defaultUiBaseFontSize(native: boolean): number {
  return native ? 15 : FONT_SIZE.base;
}

export const DEFAULT_UI_BASE_FONT_SIZE = defaultUiBaseFontSize(isNative);
export const MIN_UI_BASE_FONT_SIZE = 10;
export const MAX_UI_BASE_FONT_SIZE = 21;
export function defaultContentFontSize(native: boolean): number {
  return native ? 16 : FONT_SIZE.content;
}

export const DEFAULT_CONTENT_FONT_SIZE = defaultContentFontSize(isNative);
export const MIN_CONTENT_FONT_SIZE = 10;
export const MAX_CONTENT_FONT_SIZE = 21;
export const DEFAULT_CODE_FONT_SIZE = 12; // == FONT_SIZE.code
export const MIN_CODE_FONT_SIZE = 9;
export const MAX_CODE_FONT_SIZE = 22; // line-height 1.5×22=33 stays safe
export const MAX_FONT_FAMILY_LENGTH = 200;

export const RECENTLY_DONE_WINDOW_OPTIONS = [0, 1, 5, 15, 30, 60] as const; // minutes, 0 = off
export type RecentlyDoneWindowMinutes = (typeof RECENTLY_DONE_WINDOW_OPTIONS)[number];

export interface AppSettings {
  theme: ThemePreference;
  /** Which contributed theme `theme: "plugin"` selects. */
  pluginThemeId: string | null;
  language: AppLanguage;
  sendBehavior: SendBehavior;
  serviceUrlBehavior: ServiceUrlBehavior;
  terminalScrollbackLines: number;
  useLegacyTerminalRenderer: boolean;
  uiFontFamily: string; // "" = platform default UI stack
  monoFontFamily: string; // "" = platform default mono stack
  uiBaseFontSize: number; // clamped px, platform default 14 or 15
  contentFontSize: number; // clamped px, platform default 15 or 16
  codeFontSize: number; // clamped px, default 12
  syntaxTheme: SyntaxThemeId; // default "one"
  workspaceTitleSource: WorkspaceTitleSource;
  sidebarWorkspaceTrailing: SidebarWorkspaceTrailing;
  sidebarRowItems: SidebarRowItems;
  sidebarChecksDisplay: SidebarChecksDisplay;
  compactSidebarRows: boolean;
  showNewWorkspaceRow: boolean;
  recentlyDoneWindowMinutes: RecentlyDoneWindowMinutes;
  autoExpandReasoning: boolean;
  toolCallDetailLevel: ToolCallDetailLevel;
  chatOutlineEnabled: boolean;
  vimKeybindings: boolean;
  /** Desktop-only preferences for implicit opens into the ordinary side pane. */
  openInSidePane: OpenInSidePanePreferences;
  pullRequestOpenLocation: PullRequestOpenLocation;
}

export interface OpenInSidePanePreferences {
  explorerFiles: boolean;
  diffs: boolean;
  chatFiles: boolean;
  diffFiles: boolean;
  subagents: boolean;
}

export const DEFAULT_OPEN_IN_SIDE_PANE_PREFERENCES: OpenInSidePanePreferences = {
  explorerFiles: false,
  diffs: false,
  chatFiles: false,
  diffFiles: false,
  subagents: false,
};

export interface Settings extends AppSettings {
  manageBuiltInDaemon: boolean;
  releaseChannel: ReleaseChannel;
}

export type AppSettingsUpdate = Omit<Partial<AppSettings>, "sidebarRowItems"> & {
  sidebarRowItems?: Partial<SidebarRowItems>;
};

interface LegacyAppearanceSettings {
  hideWorkspaceDiffStats?: unknown;
  hideHostLabels?: unknown;
  compactSidebarRows?: unknown;
  hidePrStatus?: unknown;
  hideNewWorkspaceRow?: unknown;
  hideScriptIndicators?: unknown;
  recentlyDoneWindowMinutes?: unknown;
}

export const DEFAULT_CLIENT_SETTINGS: AppSettings = {
  theme: DEFAULT_THEME_PREFERENCE,
  pluginThemeId: null,
  language: "system",
  sendBehavior: "steer",
  serviceUrlBehavior: "ask",
  terminalScrollbackLines: DEFAULT_TERMINAL_SCROLLBACK_LINES,
  useLegacyTerminalRenderer: false,
  uiFontFamily: "",
  monoFontFamily: "",
  uiBaseFontSize: DEFAULT_UI_BASE_FONT_SIZE,
  contentFontSize: DEFAULT_CONTENT_FONT_SIZE,
  codeFontSize: DEFAULT_CODE_FONT_SIZE,
  syntaxTheme: "one",
  workspaceTitleSource: "title",
  sidebarWorkspaceTrailing: "diff",
  sidebarRowItems: DEFAULT_SIDEBAR_ROW_ITEMS,
  sidebarChecksDisplay: DEFAULT_SIDEBAR_CHECKS_DISPLAY,
  compactSidebarRows: false,
  showNewWorkspaceRow: true,
  recentlyDoneWindowMinutes: 0,
  autoExpandReasoning: false,
  toolCallDetailLevel: "detailed",
  chatOutlineEnabled: true,
  vimKeybindings: false,
  openInSidePane: DEFAULT_OPEN_IN_SIDE_PANE_PREFERENCES,
  pullRequestOpenLocation: "explorer",
};

export const DEFAULT_APP_SETTINGS: Settings = {
  ...DEFAULT_CLIENT_SETTINGS,
  manageBuiltInDaemon: true,
  releaseChannel: "stable",
};

function clampedNumber(min: number, max: number) {
  return z
    .unknown()
    .transform((value) => parseClampedFontSize(value, { min, max }))
    .pipe(z.number());
}

function sanitizedFontFamily() {
  return z.unknown().transform(sanitizeFontFamily).pipe(z.string());
}

const SidebarRowItemsSchema = z
  .looseObject({
    branch: z.boolean().catch(DEFAULT_SIDEBAR_ROW_ITEMS.branch),
    project: z.boolean().catch(DEFAULT_SIDEBAR_ROW_ITEMS.project),
    host: z.boolean().catch(DEFAULT_SIDEBAR_ROW_ITEMS.host),
    changeRequest: z.boolean().catch(DEFAULT_SIDEBAR_ROW_ITEMS.changeRequest),
    services: z.boolean().optional().catch(undefined),
    labels: z.boolean().catch(DEFAULT_SIDEBAR_ROW_ITEMS.labels),
    // COMPAT(sidebarRowItemsChecks): migrated in v0.3.0, remove after 2027-08-05.
    checks: z.boolean().optional().catch(undefined),
    // COMPAT(sidebarRowItemsScripts): migrated in v0.3.0, remove after 2027-08-05.
    scripts: z.boolean().optional().catch(undefined),
  })
  .catch(DEFAULT_SIDEBAR_ROW_ITEMS);

type StoredAppSettingsFallback = AppSettings & {
  uiFontSize?: number;
  compactToolCalls?: boolean;
  manageBuiltInDaemon?: boolean;
  releaseChannel?: ReleaseChannel;
  needsWrite: boolean;
};

const DEFAULT_STORED_APP_SETTINGS = {
  ...DEFAULT_CLIENT_SETTINGS,
  needsWrite: false,
} satisfies StoredAppSettingsFallback;

const StoredAppSettingsSchema = z
  .looseObject({
    theme: ThemePreferenceSchema.catch(DEFAULT_THEME_PREFERENCE),
    pluginThemeId: z.string().nullable().catch(null),
    language: z
      .enum(["system", "ar", "en", "es", "fr", "ja", "ko", "pt-BR", "ru", "zh-CN"])
      .catch("system"),
    sendBehavior: z.enum(["interrupt", "steer", "queue"]).catch("steer"),
    serviceUrlBehavior: z.enum(["ask", "in-app", "external"]).catch("ask"),
    terminalScrollbackLines: clampedNumber(
      MIN_TERMINAL_SCROLLBACK_LINES,
      MAX_TERMINAL_SCROLLBACK_LINES,
    ).catch(DEFAULT_TERMINAL_SCROLLBACK_LINES),
    useLegacyTerminalRenderer: z.boolean().catch(false),
    uiFontFamily: sanitizedFontFamily().catch(""),
    monoFontFamily: sanitizedFontFamily().catch(""),
    uiBaseFontSize: clampedNumber(MIN_UI_BASE_FONT_SIZE, MAX_UI_BASE_FONT_SIZE)
      .optional()
      .catch(undefined),
    contentFontSize: clampedNumber(MIN_CONTENT_FONT_SIZE, MAX_CONTENT_FONT_SIZE)
      .optional()
      .catch(DEFAULT_CONTENT_FONT_SIZE),
    // COMPAT(uiFontSizeScale): replaced by the literal base size in v0.4, remove after 2027-08-17.
    uiFontSize: clampedNumber(11, 24).optional().catch(undefined),
    codeFontSize: clampedNumber(MIN_CODE_FONT_SIZE, MAX_CODE_FONT_SIZE).catch(
      DEFAULT_CODE_FONT_SIZE,
    ),
    syntaxTheme: z.string().refine(isSyntaxThemeId).catch("one"),
    workspaceTitleSource: z.enum(["title", "branch"]).catch("title"),
    sidebarWorkspaceTrailing: z.enum(["diff", "timestamp", "none"]).optional().catch(undefined),
    sidebarRowItems: SidebarRowItemsSchema.optional(),
    sidebarChecksDisplay: z
      .enum(["iconAndText", "icon", "none"])
      .optional()
      .catch(undefined),
    compactSidebarRows: z.boolean().optional().catch(undefined),
    showNewWorkspaceRow: z.boolean().optional().catch(undefined),
    recentlyDoneWindowMinutes: z
      .union([z.literal(0), z.literal(1), z.literal(5), z.literal(15), z.literal(30), z.literal(60)])
      .optional()
      .catch(undefined),
    autoExpandReasoning: z.boolean().catch(false),
    toolCallDetailLevel: z
      .enum(["overview", "detailed"])
      .or(z.literal("concise").transform(() => "overview" as const))
      .optional()
      .catch("detailed"),
    // COMPAT(compactToolCalls): migrated in v0.1.105, remove after 2027-01-12.
    compactToolCalls: z.boolean().optional().catch(undefined),
    chatOutlineEnabled: z.boolean().catch(true),
    vimKeybindings: z.boolean().catch(false),
    openInSidePane: z
      .object({
        explorerFiles: z.boolean().catch(false),
        diffs: z.boolean().optional(),
        // COMPAT(diffDestinationPreference): legacy split preferences, remove after 2027-02-26.
        explorerChanges: z.boolean().optional(),
        changesLinks: z.boolean().optional(),
        chatFiles: z.boolean().catch(false),
        diffFiles: z.boolean().catch(false),
        subagents: z.boolean().catch(false),
        // COMPAT(pullRequestOpenLocation): legacy side-pane toggle, remove after 2027-02-26.
        pullRequests: z.boolean().optional(),
      })
      .transform(({ explorerChanges, changesLinks, pullRequests, ...preferences }) => ({
        ...preferences,
        diffs: preferences.diffs ?? explorerChanges ?? changesLinks ?? false,
        legacyPullRequestsInSidePane: pullRequests,
      }))
      .catch({
        ...DEFAULT_OPEN_IN_SIDE_PANE_PREFERENCES,
        legacyPullRequestsInSidePane: undefined,
      }),
    pullRequestOpenLocation: z.enum(["main", "side", "explorer"]).optional(),
    appearance: z.unknown().optional().catch(undefined),
    // COMPAT(explorerSidebarRouting): replaced by source-specific side-pane preferences in v0.6.
    openSupportingTabsInSidePanel: z.boolean().optional().catch(undefined),
    // COMPAT(rendererDesktopSettings): these fields used to share this renderer-owned key.
    manageBuiltInDaemon: z.boolean().optional().catch(undefined),
    releaseChannel: z.enum(["stable", "beta"]).optional().catch(undefined),
  })
  .transform((stored) => {
    const { legacyPullRequestsInSidePane, ...openInSidePane } = stored.openInSidePane;
    const needsWrite =
      (stored.uiBaseFontSize === undefined && stored.uiFontSize !== undefined) ||
      stored.contentFontSize === undefined;
    const uiBaseFontSize =
      stored.uiBaseFontSize ??
      (stored.uiFontSize === undefined
        ? DEFAULT_UI_BASE_FONT_SIZE
        : Math.round((FONT_SIZE.base * stored.uiFontSize) / 16));
    const toolCallDetailLevel =
      stored.toolCallDetailLevel ?? (stored.compactToolCalls ? "overview" : "detailed");
    const { appearance: _appearance, ...storedWithoutAppearance } = stored;
    return {
      ...storedWithoutAppearance,
      openInSidePane,
      pullRequestOpenLocation:
        stored.pullRequestOpenLocation ?? (legacyPullRequestsInSidePane ? "side" : "explorer"),
      uiBaseFontSize,
      contentFontSize: stored.contentFontSize ?? uiBaseFontSize,
      ...resolveSidebarSettings(stored),
      toolCallDetailLevel,
      needsWrite,
    };
  })
  .catch(DEFAULT_STORED_APP_SETTINGS);

type StoredAppSettings = z.output<typeof StoredAppSettingsSchema>;
export type PersistedAppSettings = Omit<StoredAppSettings, "needsWrite">;

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface DesktopSettingsBridge {
  isElectron(): boolean;
  loadDesktopSettings(): Promise<DesktopSettings>;
  migrateLegacyDesktopSettings(input: {
    manageBuiltInDaemon?: boolean;
    releaseChannel?: ReleaseChannel;
  }): Promise<void>;
}

export interface SettingsDeps {
  storage: KeyValueStorage;
  desktop: DesktopSettingsBridge;
}

export async function saveAppSettings(input: {
  queryClient: QueryClient;
  updates: AppSettingsUpdate;
  deps: SettingsDeps;
}): Promise<void> {
  const storedCurrent =
    input.queryClient.getQueryData<AppSettings>(APP_SETTINGS_QUERY_KEY) ??
    (await loadAppSettingsFromStorage(input.deps));
  const current = normalizeAppSettings(storedCurrent);
  const sidebarRowItems = input.updates.sidebarRowItems
    ? { ...current.sidebarRowItems, ...input.updates.sidebarRowItems }
    : current.sidebarRowItems;
  const next = { ...current, ...input.updates, sidebarRowItems };
  input.queryClient.setQueryData<AppSettings>(APP_SETTINGS_QUERY_KEY, next);
  await writeAppSettings(
    input.deps.storage,
    (await readSettingsObject(input.deps.storage, APP_SETTINGS_KEY)) ??
      StoredAppSettingsSchema.parse({}),
    next,
  );
}

export async function loadAppSettingsFromStorage(deps: SettingsDeps): Promise<AppSettings> {
  try {
    const read = await readAppSettings(deps);
    if (read.needsWrite) {
      await writeAppSettings(deps.storage, read.stored, read.settings);
    }
    const { needsWrite: _needsWrite, ...stored } = read.stored;
    return await migrateAppSettings(read.settings, deps.storage, stored, { native: isNative });
  } catch (error) {
    console.error("[AppSettings] Failed to load settings:", error);
    throw error;
  }
}

/**
 * Reads whichever of the settings blobs exists, without migrating. `needsWrite` covers the reads
 * that produce settings the stored blob does not already spell out.
 */
async function readAppSettings(
  deps: SettingsDeps,
): Promise<{ settings: AppSettings; needsWrite: boolean; stored: StoredAppSettings }> {
  const stored = await readSettingsObject(deps.storage, APP_SETTINGS_KEY);
  if (stored) {
    return {
      settings: normalizeAppSettings(stored),
      // COMPAT(uiFontSizeScale): persist the converted base size, remove after 2027-08-17.
      needsWrite: stored.needsWrite,
      stored,
    };
  }

  const legacyStored = await readSettingsObject(deps.storage, LEGACY_SETTINGS_KEY);
  if (legacyStored) {
    return {
      settings: {
        ...DEFAULT_CLIENT_SETTINGS,
        ...pickAppSettingsFromLegacy(legacyStored),
      } satisfies AppSettings,
      needsWrite: true,
      stored: legacyStored,
    };
  }

  const defaultStored = StoredAppSettingsSchema.parse({});
  return { settings: DEFAULT_CLIENT_SETTINGS, needsWrite: true, stored: defaultStored };
}

export async function loadSettingsFromStorage(deps: SettingsDeps): Promise<Settings> {
  const legacyDesktopSettings = deps.desktop.isElectron()
    ? await loadLegacyDesktopSettingsFromStorage(deps.storage)
    : null;
  const appSettings = await loadAppSettingsFromStorage(deps);

  if (!deps.desktop.isElectron()) {
    return {
      ...DEFAULT_APP_SETTINGS,
      ...appSettings,
    };
  }

  if (legacyDesktopSettings) {
    await deps.desktop.migrateLegacyDesktopSettings(legacyDesktopSettings);
  }

  const desktopSettings = await deps.desktop.loadDesktopSettings();
  return {
    ...DEFAULT_APP_SETTINGS,
    ...appSettings,
    manageBuiltInDaemon: desktopSettings.daemon.manageBuiltInDaemon,
    releaseChannel: desktopSettings.releaseChannel,
  };
}

export function normalizeAppSettings(value: unknown): AppSettings {
  const {
    needsWrite: _needsWrite,
    manageBuiltInDaemon: _manageBuiltInDaemon,
    releaseChannel: _releaseChannel,
    compactToolCalls: _compactToolCalls,
    uiFontSize: _uiFontSize,
    openSupportingTabsInSidePanel: _openSupportingTabsInSidePanel,
    ...settings
  } = StoredAppSettingsSchema.parse(value);
  return settings;
}

function pickAppSettingsFromLegacy(legacy: StoredAppSettings): AppSettings {
  const settings = normalizeAppSettings(legacy);
  return {
    ...settings,
    // The legacy key rendered content on the interface ramp. Freeze that
    // rendered value into the new independent preference during migration.
    contentFontSize: legacy.uiBaseFontSize,
  };
}

function parseToolCallDetailLevel(stored: StoredAppSettings): ToolCallDetailLevel | null {
  if (stored.toolCallDetailLevel !== undefined) {
    if (
      typeof stored.toolCallDetailLevel === "string" &&
      VALID_TOOL_CALL_DETAIL_LEVELS.has(stored.toolCallDetailLevel)
    ) {
      return stored.toolCallDetailLevel;
    }
    // COMPAT(toolCallDetailLevelConcise): removed in v0.1.107; legacy "concise" values
    // deliberately follow the unknown-value fallback. Remove after 2027-01-14.
    return "overview";
  }
  if (typeof stored.compactToolCalls === "boolean") {
    // COMPAT(compactToolCalls): migrated in v0.1.105, remove after 2027-01-12.
    return stored.compactToolCalls ? "overview" : "detailed";
  }
  return null;
}

function parseStoredSidebarChecksDisplay(stored: StoredAppSettings): SidebarChecksDisplay | null {
  const display = parseSidebarChecksDisplay(stored.sidebarChecksDisplay);
  if (display !== null) {
    return display;
  }
  // COMPAT(sidebarRowItemsChecks): migrated in v0.3.0, remove after 2027-08-05.
  return isChecksHiddenByLegacyRowItem(stored.sidebarRowItems) ? "none" : null;
}

function pickBooleanAppSettings(stored: StoredAppSettings): Partial<AppSettings> {
  const result: Partial<AppSettings> = {};
  if (typeof stored.useLegacyTerminalRenderer === "boolean") {
    result.useLegacyTerminalRenderer = stored.useLegacyTerminalRenderer;
  }
  if (typeof stored.vimKeybindings === "boolean") {
    result.vimKeybindings = stored.vimKeybindings;
  }
  if (typeof stored.chatOutlineEnabled === "boolean") {
    result.chatOutlineEnabled = stored.chatOutlineEnabled;
  }
  if (typeof stored.openSupportingTabsInSidePanel === "boolean") {
    result.openSupportingTabsInSidePanel = stored.openSupportingTabsInSidePanel;
  }
  if (typeof stored.compactSidebarRows === "boolean") {
    result.compactSidebarRows = stored.compactSidebarRows;
  }
  if (typeof stored.showNewWorkspaceRow === "boolean") {
    result.showNewWorkspaceRow = stored.showNewWorkspaceRow;
  }
  return result;
}

/**
 * The settings whose stored value only has to be a member of a fixed set. Grouped like the
 * boolean settings are: the numeric and font settings need real parsing and clamping, these
 * need a membership check and nothing else.
 */
function pickEnumAppSettings(stored: StoredAppSettings): Partial<AppSettings> {
  const result: Partial<AppSettings> = {};
  if (typeof stored.theme === "string" && VALID_THEMES.has(stored.theme)) {
    result.theme = stored.theme;
  }
  if (
    stored.sendBehavior === "interrupt" ||
    stored.sendBehavior === "steer" ||
    stored.sendBehavior === "queue"
  ) {
    result.sendBehavior = stored.sendBehavior;
  }
  if (
    typeof stored.serviceUrlBehavior === "string" &&
    VALID_SERVICE_URL_BEHAVIORS.has(stored.serviceUrlBehavior)
  ) {
    result.serviceUrlBehavior = stored.serviceUrlBehavior;
  }
  if (typeof stored.syntaxTheme === "string" && isSyntaxThemeId(stored.syntaxTheme)) {
    result.syntaxTheme = stored.syntaxTheme;
  }
  if (
    typeof stored.workspaceTitleSource === "string" &&
    VALID_WORKSPACE_TITLE_SOURCES.has(stored.workspaceTitleSource)
  ) {
    result.workspaceTitleSource = stored.workspaceTitleSource;
  }
  if (
    typeof stored.sidebarWorkspaceTrailing === "string" &&
    VALID_SIDEBAR_WORKSPACE_TRAILINGS.has(stored.sidebarWorkspaceTrailing)
  ) {
    result.sidebarWorkspaceTrailing = stored.sidebarWorkspaceTrailing;
  }
  return result;
}

function pickSidebarAppSettings(stored: StoredAppSettings): Partial<AppSettings> {
  const result: Partial<AppSettings> = {};
  const legacyAppearance = parseLegacyAppearance(stored.appearance);
  result.sidebarRowItems =
    stored.sidebarRowItems !== undefined
      ? parseSidebarRowItems(stored.sidebarRowItems)
      : {
          ...DEFAULT_SIDEBAR_ROW_ITEMS,
          host: !readBoolean(legacyAppearance?.hideHostLabels, false),
          changeRequest: !readBoolean(legacyAppearance?.hidePrStatus, false),
          services: !readBoolean(legacyAppearance?.hideScriptIndicators, false),
        };
  if (
    stored.sidebarWorkspaceTrailing === undefined &&
    readBoolean(legacyAppearance?.hideWorkspaceDiffStats, false)
  ) {
    result.sidebarWorkspaceTrailing = "none";
  }
  if (typeof stored.compactSidebarRows !== "boolean" && legacyAppearance) {
    result.compactSidebarRows = readBoolean(legacyAppearance.compactSidebarRows, false);
  }
  if (typeof stored.showNewWorkspaceRow !== "boolean" && legacyAppearance) {
    result.showNewWorkspaceRow = !readBoolean(legacyAppearance.hideNewWorkspaceRow, false);
  }
  result.recentlyDoneWindowMinutes = readRecentlyDoneWindowMinutes(
    stored.recentlyDoneWindowMinutes ?? legacyAppearance?.recentlyDoneWindowMinutes,
  );
  return result;
}

function pickAppSettings(stored: StoredAppSettings): Partial<AppSettings> {
  const result: Partial<AppSettings> = {};
  Object.assign(result, pickEnumAppSettings(stored), pickSidebarAppSettings(stored));
  if (typeof stored.pluginThemeId === "string") {
    result.pluginThemeId = stored.pluginThemeId;
  }
  const sidebarChecksDisplay = parseStoredSidebarChecksDisplay(stored);
  if (sidebarChecksDisplay !== null) {
    result.sidebarChecksDisplay = sidebarChecksDisplay;
  }
  const language = parseAppLanguage(stored.language);
  if (language !== null) {
    result.language = language;
  }
  const terminalScrollbackLines = parseTerminalScrollbackLines(stored.terminalScrollbackLines);
  if (terminalScrollbackLines !== null) {
    result.terminalScrollbackLines = terminalScrollbackLines;
  }
  const uiFontFamily = sanitizeFontFamily(stored.uiFontFamily);
  if (uiFontFamily !== null) {
    result.uiFontFamily = uiFontFamily;
  }
  const monoFontFamily = sanitizeFontFamily(stored.monoFontFamily);
  if (monoFontFamily !== null) {
    result.monoFontFamily = monoFontFamily;
  }
  const uiBaseFontSize = parseClampedFontSize(stored.uiBaseFontSize, {
    min: MIN_UI_BASE_FONT_SIZE,
    max: MAX_UI_BASE_FONT_SIZE,
  });
  if (uiBaseFontSize !== null) {
    result.uiBaseFontSize = uiBaseFontSize;
  } else {
    const legacyUiFontSize = parseClampedFontSize(stored.uiFontSize, {
      min: 11,
      max: 24,
    });
    if (legacyUiFontSize !== null) {
      result.uiBaseFontSize = Math.round((FONT_SIZE.base * legacyUiFontSize) / 16);
    }
  }
  const contentFontSize = parseClampedFontSize(stored.contentFontSize, {
    min: MIN_CONTENT_FONT_SIZE,
    max: MAX_CONTENT_FONT_SIZE,
  });
  if (contentFontSize !== null) {
    result.contentFontSize = contentFontSize;
  } else if (stored.contentFontSize === undefined) {
    // Existing content followed the interface ramp. Preserve that rendered size
    // once, then persist the independent setting during the read migration.
    result.contentFontSize = result.uiBaseFontSize ?? DEFAULT_UI_BASE_FONT_SIZE;
  }
  const codeFontSize = parseClampedFontSize(stored.codeFontSize, {
    min: MIN_CODE_FONT_SIZE,
    max: MAX_CODE_FONT_SIZE,
  });
  if (codeFontSize !== null) {
    result.codeFontSize = codeFontSize;
  }
  Object.assign(result, pickBooleanAppSettings(stored));
  if (typeof stored.autoExpandReasoning === "boolean") {
    result.autoExpandReasoning = stored.autoExpandReasoning;
  }
  const toolCallDetailLevel = parseToolCallDetailLevel(stored);
  if (toolCallDetailLevel !== null) {
    result.toolCallDetailLevel = toolCallDetailLevel;
  }
  return result;
}

function resolveSidebarSettings(stored: {
  appearance?: unknown;
  sidebarRowItems?: SidebarRowItems & { scripts?: boolean };
  sidebarChecksDisplay?: SidebarChecksDisplay;
  sidebarWorkspaceTrailing?: SidebarWorkspaceTrailing;
  compactSidebarRows?: boolean;
  showNewWorkspaceRow?: boolean;
  recentlyDoneWindowMinutes?: RecentlyDoneWindowMinutes;
}) {
  const legacyAppearance = parseLegacyAppearance(stored.appearance);
  const sidebarRowItems = stored.sidebarRowItems
    ? {
        ...stored.sidebarRowItems,
        services:
          stored.sidebarRowItems.services ??
          (stored.sidebarRowItems.scripts === false ? false : DEFAULT_SIDEBAR_ROW_ITEMS.services),
      }
    : {
        ...DEFAULT_SIDEBAR_ROW_ITEMS,
        host: !readBoolean(legacyAppearance?.hideHostLabels, false),
        changeRequest: !readBoolean(legacyAppearance?.hidePrStatus, false),
        services: !readBoolean(legacyAppearance?.hideScriptIndicators, false),
      };
  return {
    sidebarRowItems,
    sidebarChecksDisplay:
      stored.sidebarChecksDisplay ??
      (isChecksHiddenByLegacyRowItem(stored.sidebarRowItems ?? sidebarRowItems)
        ? "none"
        : DEFAULT_SIDEBAR_CHECKS_DISPLAY),
    sidebarWorkspaceTrailing:
      stored.sidebarWorkspaceTrailing ??
      (readBoolean(legacyAppearance?.hideWorkspaceDiffStats, false) ? "none" : "diff"),
    compactSidebarRows:
      typeof stored.compactSidebarRows === "boolean"
        ? stored.compactSidebarRows
        : readBoolean(legacyAppearance?.compactSidebarRows, false),
    showNewWorkspaceRow:
      typeof stored.showNewWorkspaceRow === "boolean"
        ? stored.showNewWorkspaceRow
        : !readBoolean(legacyAppearance?.hideNewWorkspaceRow, false),
    recentlyDoneWindowMinutes: readRecentlyDoneWindowMinutes(
      stored.recentlyDoneWindowMinutes ?? legacyAppearance?.recentlyDoneWindowMinutes,
    ),
  };
}

function parseLegacyAppearance(value: unknown): LegacyAppearanceSettings | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return {
    hideWorkspaceDiffStats:
      "hideWorkspaceDiffStats" in value ? value.hideWorkspaceDiffStats : undefined,
    hideHostLabels: "hideHostLabels" in value ? value.hideHostLabels : undefined,
    compactSidebarRows: "compactSidebarRows" in value ? value.compactSidebarRows : undefined,
    hidePrStatus: "hidePrStatus" in value ? value.hidePrStatus : undefined,
    hideNewWorkspaceRow: "hideNewWorkspaceRow" in value ? value.hideNewWorkspaceRow : undefined,
    hideScriptIndicators: "hideScriptIndicators" in value ? value.hideScriptIndicators : undefined,
    recentlyDoneWindowMinutes:
      "recentlyDoneWindowMinutes" in value ? value.recentlyDoneWindowMinutes : undefined,
  };
}

function readRecentlyDoneWindowMinutes(value: unknown): RecentlyDoneWindowMinutes {
  const match = RECENTLY_DONE_WINDOW_OPTIONS.find((option) => option === value);
  return match ?? 0;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseTerminalScrollbackLines(value: unknown): number | null {
  let numericValue = NaN;
  if (typeof value === "number") {
    numericValue = value;
  } else if (typeof value === "string" && value.trim().length > 0) {
    numericValue = Number(value);
  }
  if (!Number.isFinite(numericValue)) {
    return null;
  }
  return Math.min(
    MAX_TERMINAL_SCROLLBACK_LINES,
    Math.max(MIN_TERMINAL_SCROLLBACK_LINES, Math.floor(numericValue)),
  );
}

export function parseClampedFontSize(
  value: unknown,
  bounds: { min: number; max: number },
): number | null {
  let numericValue = NaN;
  if (typeof value === "number") {
    numericValue = value;
  } else if (typeof value === "string" && value.trim().length > 0) {
    numericValue = Number(value);
  }
  if (!Number.isFinite(numericValue)) {
    return null;
  }
  return Math.min(bounds.max, Math.max(bounds.min, Math.floor(numericValue)));
}

export function sanitizeFontFamily(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return ""; // explicit empty = default
  }
  if (trimmed.length > MAX_FONT_FAMILY_LENGTH) {
    return null;
  }
  if (/[;{}<>]/.test(trimmed)) {
    return null; // would break the web CSS font-family declaration
  }
  if ([...trimmed].some((char) => char.charCodeAt(0) <= 0x1f)) {
    return null; // control chars would corrupt the font-family string
  }
  return trimmed; // quotes/commas are legit in stacks
}

async function loadLegacyDesktopSettingsFromStorage(storage: KeyValueStorage): Promise<{
  manageBuiltInDaemon?: boolean;
  releaseChannel?: ReleaseChannel;
} | null> {
  const stored = await loadRendererSettingsPayload(storage);
  if (!stored) {
    return null;
  }

  const result: {
    manageBuiltInDaemon?: boolean;
    releaseChannel?: ReleaseChannel;
  } = {};

  if (stored.manageBuiltInDaemon !== undefined) {
    result.manageBuiltInDaemon = stored.manageBuiltInDaemon;
  }
  if (stored.releaseChannel !== undefined) {
    result.releaseChannel = stored.releaseChannel;
  }

  return Object.keys(result).length > 0 ? result : null;
}

async function loadRendererSettingsPayload(
  storage: KeyValueStorage,
): Promise<StoredAppSettings | null> {
  const current = await readSettingsObject(storage, APP_SETTINGS_KEY);
  if (current) {
    return current;
  }

  return readSettingsObject(storage, LEGACY_SETTINGS_KEY);
}

async function readSettingsObject(
  storage: KeyValueStorage,
  key: string,
): Promise<StoredAppSettings | null> {
  const raw = await storage.getItem(key);
  if (raw === null) {
    return null;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    console.warn(`[AppSettings] Removing corrupt ${key}: invalid JSON.`);
    await storage.removeItem(key);
    return null;
  }
  return StoredAppSettingsSchema.parse(decoded);
}

async function writeAppSettings(
  storage: KeyValueStorage,
  stored: StoredAppSettings,
  settings: AppSettings,
): Promise<void> {
  const { needsWrite: _needsWrite, ...persistedStored } = stored;
  const storedSidebarRowItems = persistedStored.sidebarRowItems;
  await storage.setItem(
    APP_SETTINGS_KEY,
    JSON.stringify({
      ...persistedStored,
      ...settings,
      sidebarRowItems: { ...storedSidebarRowItems, ...settings.sidebarRowItems },
    }),
  );
}
