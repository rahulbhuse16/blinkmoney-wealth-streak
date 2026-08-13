import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  spacing,
} from "@/theme";

interface CircleShareCardProps {
  durationDays: number;
  friendCount: number;
}

/**
 * Mirrors the visual language of ShareAchievementCard (wealthStreak feature)
 * but is its own component since the content shape differs (multiple stat
 * rows vs. a single streak number). Only ever receives counts — never
 * member names, streak values, or anything financial — so it's structurally
 * safe to post publicly.
 */
export const CircleShareCard = forwardRef<View, CircleShareCardProps>(
  ({ durationDays, friendCount }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.wrapper}>
        <LinearGradient
          colors={[colors.bgElevated, colors.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.badgeCircle}>
            <Text style={styles.trophy}>🏆</Text>
          </View>
          <Text style={styles.days}>{durationDays} DAYS</Text>

          <Text style={styles.headline}>WE BUILT THE HABIT.</Text>

          <View style={styles.statsBlock}>
            <StatLine label="FRIENDS" value={String(friendCount)} />
            <StatLine label="CHALLENGE" value="1" />
            <StatLine label="DAYS" value={String(durationDays)} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.brand}>BlinkMoney</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);
CircleShareCard.displayName = "CircleShareCard";

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: radius.xl, overflow: "hidden" },
  card: {
    width: 320,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgElevatedAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  trophy: { fontSize: 30 },
  days: {
    color: colors.gold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.tight,
  },
  headline: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    textAlign: "center",
    marginTop: spacing.md,
    letterSpacing: letterSpacing.tight,
  },
  statsBlock: {
    marginTop: spacing.xl,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xxs,
  },
  statValue: {
    color: colors.mint,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: "100%",
    alignItems: "center",
  },
  brand: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
});