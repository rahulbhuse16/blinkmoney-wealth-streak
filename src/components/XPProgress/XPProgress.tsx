import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ProgressBar";
import { useCountUp } from "@/hooks/useCountUp";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

interface XPProgressProps {
  level: number;
  levelTitle?: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}

export function XPProgress({
  level,
  levelTitle,
  currentXP,
  xpForCurrentLevel,
  xpForNextLevel,
}: XPProgressProps) {
  const displayXP = useCountUp(currentXP);
  const span = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const progress = (currentXP - xpForCurrentLevel) / span;
  const xpRemaining = Math.max(0, xpForNextLevel - currentXP);

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>LVL {level}</Text>
        </View>
        {levelTitle ? (
          <Text style={styles.levelTitle}>{levelTitle}</Text>
        ) : null}
        <Text style={styles.xpText}>{displayXP.toLocaleString()} XP</Text>
      </View>
      <ProgressBar
        progress={progress}
        height={10}
        fillColor={colors.mint}
        style={{ marginTop: spacing.sm }}
        accessibilityLabel={`Level ${level} progress, ${Math.round(progress * 100)} percent to next level`}
      />
      <Text style={styles.caption}>
        {xpRemaining.toLocaleString()} XP to Level {level + 1}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center" },
  levelPill: {
    backgroundColor: colors.mintDeep,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  levelPillText: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
  },
  levelTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
    flex: 1,
  },
  xpText: {
    color: colors.mintSoft,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  caption: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
  },
});
