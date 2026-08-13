import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = "Couldn't load your wealth journey.",
  description,
  onRetry,
  retryLabel = "Retry",
  secondaryLabel,
  onSecondary,
  compact = false,
}: ErrorStateProps) {
  return (
    <View
      style={[styles.container, compact && styles.compact]}
      accessible
      accessibilityLabel={title}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle" size={26} color={colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.buttonRow}>
        {secondaryLabel && onSecondary ? (
          <View style={styles.secondaryBtn}>
            <Button
              label={secondaryLabel}
              variant="secondary"
              onPress={onSecondary}
              fullWidth={false}
            />
          </View>
        ) : null}
        {onRetry ? (
          <View style={styles.retryBtn}>
            <Button label={retryLabel} onPress={onRetry} fullWidth={false} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  compact: { paddingVertical: spacing.xl },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: "center",
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  buttonRow: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.sm },
  secondaryBtn: { minWidth: 100 },
  retryBtn: { minWidth: 100 },
});
