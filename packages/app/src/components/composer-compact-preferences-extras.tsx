import { useCallback, type ReactElement } from "react";
import { Pressable, Text, View, type PressableStateCallbackType } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AudioLines } from "lucide-react-native";
import { ContextWindowMeter } from "./context-window-meter";
import { ICON_SIZE, type Theme } from "@/styles/theme";

interface ComposerCompactPreferencesExtrasProps {
  contextWindowMaxTokens: number | null;
  contextWindowUsedTokens: number | null;
  isVoiceModeForAgent: boolean;
  hasAgent: boolean;
  isConnected: boolean;
  isVoiceSwitching: boolean;
  handleToggleRealtimeVoice: () => void;
}

export function ComposerCompactPreferencesExtras({
  contextWindowMaxTokens,
  contextWindowUsedTokens,
  isVoiceModeForAgent,
  hasAgent,
  isConnected,
  isVoiceSwitching,
  handleToggleRealtimeVoice,
}: ComposerCompactPreferencesExtrasProps): ReactElement {
  const { theme } = useUnistyles();
  const voiceDisabled = !hasAgent || !isConnected || isVoiceSwitching || isVoiceModeForAgent;
  const voiceRowStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.compactSheetRow,
      pressed && styles.compactSheetRowPressed,
      voiceDisabled && styles.compactSheetRowDisabled,
    ],
    [voiceDisabled],
  );
  const contextMeter =
    contextWindowMaxTokens !== null && contextWindowUsedTokens !== null ? (
      <ContextWindowMeter maxTokens={contextWindowMaxTokens} usedTokens={contextWindowUsedTokens} />
    ) : (
      <View style={styles.compactSheetIconSlot} />
    );

  return (
    <View style={styles.compactSheetExtraSection}>
      <View style={styles.compactSheetRow}>
        {contextMeter}
        <View style={styles.compactSheetTextGroup}>
          <Text style={styles.compactSheetTitle}>Context window</Text>
          <Text style={styles.compactSheetDetail}>
            {formatContextWindowDetail(contextWindowMaxTokens, contextWindowUsedTokens)}
          </Text>
        </View>
      </View>
      <Pressable
        disabled={voiceDisabled}
        onPress={handleToggleRealtimeVoice}
        style={voiceRowStyle}
        accessibilityRole="button"
        accessibilityLabel={isVoiceModeForAgent ? "Voice mode active" : "Enable Voice mode"}
      >
        <AudioLines size={ICON_SIZE.md} color={theme.colors.foregroundMuted} />
        <View style={styles.compactSheetTextGroup}>
          <Text style={styles.compactSheetTitle}>Voice mode</Text>
          <Text style={styles.compactSheetDetail}>{isVoiceModeForAgent ? "On" : "Off"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function formatCompactTokenCount(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}m`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return Math.round(value).toString();
}

function formatContextWindowDetail(maxTokens: number | null, usedTokens: number | null): string {
  if (maxTokens === null || usedTokens === null || maxTokens <= 0) {
    return "Not available";
  }
  const percentage = Math.round((usedTokens / maxTokens) * 100);
  return `${percentage}% used, ${formatCompactTokenCount(usedTokens)} / ${formatCompactTokenCount(maxTokens)} tokens`;
}

const styles = StyleSheet.create((theme: Theme) => ({
  compactSheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface2,
    backgroundColor: theme.colors.surface0,
  },
  compactSheetExtraSection: {
    gap: theme.spacing[2],
  },
  compactSheetRowPressed: {
    backgroundColor: theme.colors.surface2,
  },
  compactSheetRowDisabled: {
    opacity: 0.5,
  },
  compactSheetIconSlot: {
    width: 28,
    height: 28,
  },
  compactSheetTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing[1],
  },
  compactSheetTitle: {
    color: theme.colors.foreground,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  compactSheetDetail: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
  },
}));
