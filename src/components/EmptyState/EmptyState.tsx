import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

export function EmptyState({
  emoji = "🌱",
  title,
  description,
  ctaLabel,
  onPressCta,
}: EmptyStateProps) {
  return (
    <View style={styles.container} accessible accessibilityLabel={title}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {ctaLabel && onPressCta ? (
        <View style={styles.ctaWrap}>
          <Button label={ctaLabel} onPress={onPressCta} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: "center",
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: fontSize.base * 1.5,
  },
  ctaWrap: { marginTop: spacing.xl, width: "100%" },
});
