import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Achievement } from "@/features/wealthStreak/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  compact?: boolean;
}

export function AchievementCard({
  achievement,
  onPress,
  compact = false,
}: AchievementCardProps) {
  const { title, description, icon, state, progressCurrent, progressTarget } =
    achievement;
  const isLocked = state === "locked";
  const isInProgress = state === "in_progress";
  const progress =
    progressCurrent != null && progressTarget
      ? Math.min(1, progressCurrent / progressTarget)
      : undefined;

  const content = (
    <Card
      variant={isLocked ? "outline" : "default"}
      style={StyleSheet.flatten([
        styles.card,
        compact && styles.compactCard,
        isLocked && styles.lockedCard,
      ])}
      accessible
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}. ${isLocked ? "Locked" : description}`}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, isLocked && styles.iconCircleLocked]}>
          {isLocked ? (
            <Ionicons name="lock-closed" size={16} color={colors.lockedText} />
          ) : (
            <Text style={styles.iconEmoji}>{icon}</Text>
          )}
        </View>
        {state === "unlocked" ? (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.textInverse} />
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.title, isLocked && styles.textLocked]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={[styles.description, isLocked && styles.textLocked]}
        numberOfLines={2}
      >
        {description}
      </Text>
      {isInProgress && progress != null ? (
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} height={6} fillColor={colors.gold} />
          <Text style={styles.progressText}>
            {progressCurrent} / {progressTarget}
          </Text>
        </View>
      ) : null}
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={() => onPress(achievement)} hitSlop={4}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 168, minHeight: 148 },
  compactCard: { width: "100%", minHeight: 0 },
  lockedCard: { opacity: 0.75 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevatedAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleLocked: { backgroundColor: colors.locked },
  iconEmoji: { fontSize: 20 },
  unlockedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  description: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.4,
  },
  textLocked: { color: colors.lockedText },
  progressWrap: { marginTop: spacing.sm },
  progressText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
