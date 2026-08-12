import { useCallback, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { PanelLeft, PanelRight } from "lucide-react-native";
import { ScreenHeader } from "./screen-header";
import { ScreenTitle } from "./screen-title";
import { HeaderToggleButton, headerIconSlotStyle } from "./header-toggle-button";
import { selectIsAgentListOpen, usePanelStore } from "@/stores/panel-store";
import { useIsCompactFormFactor } from "@/constants/layout";
import { getShortcutOs } from "@/utils/shortcut-platform";
import { useHasWindowChromeObstruction, useOwnsWindowChromeCorner } from "@/utils/desktop-window";
import { resolveSidebarSides, type SidebarSide } from "@/components/sidebar-sides";
import { useAppSettings } from "@/hooks/use-settings";

/** The side the workspace sidebar — and therefore its toggle — currently lives on. */
export function useAgentListSide(): SidebarSide {
  const { settings } = useAppSettings();
  return resolveSidebarSides(settings.agentListSide).agentList;
}

interface MenuHeaderProps {
  title?: string;
  rightContent?: ReactNode;
  borderless?: boolean;
}

interface SidebarMenuToggleProps {
  style?: StyleProp<ViewStyle>;
  tooltipSide?: "left" | "right" | "top" | "bottom";
  testID?: string;
  nativeID?: string;
}

const MOBILE_MENU_LINE_WIDTH = 16;
const MOBILE_MENU_LINE_SHORT_WIDTH = 8;
const MOBILE_MENU_LINE_HEIGHT = 2;

function MobileMenuIcon({ color }: { color: string }) {
  const lineStyle = useMemo(() => [styles.mobileMenuLine, { backgroundColor: color }], [color]);
  const shortLineStyle = useMemo(
    () => [styles.mobileMenuLine, styles.mobileMenuLineShort, { backgroundColor: color }],
    [color],
  );
  return (
    <View style={styles.mobileMenuIcon} pointerEvents="none">
      <View style={lineStyle} />
      <View style={lineStyle} />
      <View style={shortLineStyle} />
    </View>
  );
}

function SidebarMenuToggleButton({
  isMobile,
  extraMutedIdleIcon = false,
  resolvedStyle,
  side,
  tooltipSide = "right",
  testID = "menu-button",
  nativeID = "menu-button",
}: Omit<SidebarMenuToggleProps, "style"> & {
  isMobile: boolean;
  extraMutedIdleIcon?: boolean;
  resolvedStyle: StyleProp<ViewStyle>;
  side: SidebarSide;
}) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const isOpen = usePanelStore((state) => selectIsAgentListOpen(state, { isCompact: isMobile }));
  const toggleAgentListForLayout = usePanelStore((state) => state.toggleAgentListForLayout);
  const toggleShortcutKeys = useMemo(
    () => (getShortcutOs() === "mac" ? ["mod", "B"] : ["mod", "."]),
    [],
  );

  const handlePress = useCallback(() => {
    toggleAgentListForLayout({ isCompact: isMobile });
  }, [toggleAgentListForLayout, isMobile]);

  const accessibilityState = useMemo(() => ({ expanded: isOpen }), [isOpen]);

  return (
    <HeaderToggleButton
      onPress={handlePress}
      tooltipLabel={t("shell.menu.toggleSidebar")}
      tooltipKeys={toggleShortcutKeys}
      tooltipSide={tooltipSide}
      testID={testID}
      nativeID={nativeID}
      style={resolvedStyle}
      accessible
      accessibilityRole="button"
      accessibilityLabel={isOpen ? t("shell.menu.close") : t("shell.menu.open")}
      accessibilityState={accessibilityState}
    >
      {({ hovered, pressed }) => {
        let color = extraMutedIdleIcon
          ? theme.colors.foregroundExtraMuted
          : theme.colors.foregroundMuted;
        if (hovered || pressed) {
          color = theme.colors.foreground;
        }
        if (isMobile) {
          return <MobileMenuIcon color={color} />;
        }
        // The glyph points at the panel it opens, so it has to follow the panel.
        return side === "right" ? (
          <PanelRight size={theme.iconSize.md} color={color} />
        ) : (
          <PanelLeft size={theme.iconSize.md} color={color} />
        );
      }}
    </HeaderToggleButton>
  );
}

export function SidebarMenuToggle({ style, ...props }: SidebarMenuToggleProps = {}) {
  const isMobile = useIsCompactFormFactor();
  const side = useAgentListSide();
  const corner = side === "right" ? "top-right" : "top-left";
  const ownsCorner = useOwnsWindowChromeCorner(corner);
  const hasWindowControls = useHasWindowChromeObstruction(corner);
  const resolvedStyle = useMemo(
    () => [side === "right" ? styles.trailingToggle : styles.leadingToggle, style],
    [side, style],
  );
  const placeholderStyle = useMemo(
    () => [headerIconSlotStyle.slot, resolvedStyle],
    [resolvedStyle],
  );

  if (!isMobile && !ownsCorner) {
    return null;
  }

  if (!isMobile && hasWindowControls) {
    return (
      <View pointerEvents="none" style={placeholderStyle}>
        <View style={styles.desktopMenuIconSpace} />
      </View>
    );
  }

  return (
    <SidebarMenuToggleButton
      {...props}
      isMobile={isMobile}
      side={side}
      resolvedStyle={resolvedStyle}
    />
  );
}

export function WindowSidebarMenuToggle({ style, ...props }: SidebarMenuToggleProps = {}) {
  const side = useAgentListSide();
  const resolvedStyle = useMemo(
    () => [side === "right" ? styles.trailingToggle : styles.leadingToggle, style],
    [side, style],
  );
  return (
    <SidebarMenuToggleButton
      {...props}
      isMobile={false}
      side={side}
      extraMutedIdleIcon
      resolvedStyle={resolvedStyle}
    />
  );
}

/**
 * Renders its children only in the header cluster on the workspace sidebar's side. Both clusters
 * mount one; exactly one draws. Keeps callers free of layout branching.
 */
export function AgentListSideSlot({
  placement,
  children,
}: {
  placement: SidebarSide;
  children: ReactNode;
}): ReactNode {
  const side = useAgentListSide();
  return side === placement ? children : null;
}

/**
 * The sidebar toggle, rendered only in the header slot that matches the side its sidebar is on.
 * Both slots can mount one; at most one of them draws anything. Callers stay branch-free.
 */
export function AgentListToggleSlot({ placement }: { placement: SidebarSide }) {
  const side = useAgentListSide();
  if (side !== placement) {
    return null;
  }
  return <SidebarMenuToggle tooltipSide={placement === "right" ? "left" : "right"} />;
}

export function MenuHeader({ title, rightContent, borderless }: MenuHeaderProps) {
  return (
    <ScreenHeader
      left={
        <>
          <AgentListToggleSlot placement="left" />
          {title && <ScreenTitle>{title}</ScreenTitle>}
        </>
      }
      right={
        <>
          {rightContent}
          <AgentListToggleSlot placement="right" />
        </>
      }
      leftStyle={styles.left}
      borderless={borderless}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  leadingToggle: {
    marginLeft: {
      xs: 0,
      md: -theme.spacing[2],
    },
  },
  trailingToggle: {
    marginRight: {
      xs: 0,
      md: -theme.spacing[2],
    },
  },
  left: {
    gap: theme.spacing[2],
  },
  mobileMenuIcon: {
    width: MOBILE_MENU_LINE_WIDTH,
    height: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  desktopMenuIconSpace: {
    width: theme.iconSize.md,
    height: theme.iconSize.md,
  },
  mobileMenuLine: {
    width: MOBILE_MENU_LINE_WIDTH,
    height: MOBILE_MENU_LINE_HEIGHT,
    borderRadius: theme.borderRadius.full,
  },
  mobileMenuLineShort: {
    width: MOBILE_MENU_LINE_SHORT_WIDTH,
  },
}));
