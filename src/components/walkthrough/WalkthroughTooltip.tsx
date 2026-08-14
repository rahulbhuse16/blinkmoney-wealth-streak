import React from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadows,
  spacing,
} from "@/theme";

interface WalkthroughTooltipProps {
  title: string;
  description: string;
  stepIndex: number;
  stepCount: number;
  ctaLabel: string;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Absolute position + entrance animation, supplied by the overlay. */
  style?: React.ComponentProps<typeof Animated.View>["style"];
}

export function WalkthroughTooltip({
  title,
  description,
  stepIndex,
  stepCount,
  ctaLabel,
  canGoBack,
  onNext,
  onBack,
  onSkip,
  onLayout,
  style,
}: WalkthroughTooltipProps) {
  const isLastStep = stepIndex === stepCount - 1;

  return (
    <Animated.View
      style={[styles.tooltip, style]}
      onLayout={onLayout}
      accessible={false}
      // React Native has no "dialog" accessibility role; "alert" is the closest
      // supported role and makes screen readers announce the tooltip content.
      accessibilityRole="alert"
      accessibilityViewIsModal
      accessibilityLabel={`${title}. ${description}. Step ${stepIndex + 1} of ${stepCount}.`}
    >
      <View style={styles.headerRow}>
        <View style={styles.dotsRow}>
          {Array.from({ length: stepCount }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === stepIndex && styles.dotActive]}
            />
          ))}
          <Text style={styles.stepCounter}>
            {stepIndex + 1} of {stepCount}
          </Text>
        </View>
        <Pressable
          onPress={onSkip}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip walkthrough"
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footerRow}>
        {canGoBack ? (
          <Button
            label="Back"
            variant="ghost"
            size="md"
            fullWidth={false}
            onPress={onBack}
            accessibilityHint="Go to the previous walkthrough step"
          />
        ) : (
          <View />
        )}
        <Button
          label={ctaLabel}
          size="md"
          fullWidth={false}
          onPress={onNext}
          accessibilityHint={
            isLastStep ? "Complete walkthrough" : "Next walkthrough step"
          }
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    ...shadows.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.locked,
  },
  dotActive: { width: 18, backgroundColor: colors.gold },
  stepCounter: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  skipLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.45,
    marginTop: spacing.xxs,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
});
