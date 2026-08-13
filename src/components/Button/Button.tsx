import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Debounced, animated pressable button. Guards against double-taps by
 * ignoring presses that arrive while a previous press is still "cooling down".
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lastPressRef = useRef(0);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [scale]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      const now = Date.now();
      if (now - lastPressRef.current < 400) return; // debounce rapid double taps
      lastPressRef.current = now;
      if (disabled || loading) return;
      Haptics.selectionAsync().catch(() => {});
      onPress(e);
    },
    [disabled, loading, onPress],
  );

  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
        style={[
          styles.base,
          sizeStyles[size],
          variantStyles[variant],
          isDisabled && styles.disabled,
          style,
        ]}
        hitSlop={8}
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingDot} />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  styles.label,
                  size === "md" && styles.labelMd,
                  variantTextStyles[variant],
                  icon ? { marginLeft: spacing.xs } : null,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: "100%" },
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  labelMd: { fontSize: fontSize.base },
  disabled: { opacity: 0.45 },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
  },
});

const sizeStyles = StyleSheet.create({
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.gold },
  secondary: {
    backgroundColor: colors.bgElevatedAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: "transparent" },
  danger: {
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.error,
  },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: colors.textInverse },
  secondary: { color: colors.textPrimary },
  ghost: { color: colors.gold },
  danger: { color: colors.error },
});
