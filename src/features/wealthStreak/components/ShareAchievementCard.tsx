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

interface ShareAchievementCardProps {
  streakDays: number;
  headline: string;
  subline: string;
}

/**
 * Deliberately excludes amounts, totals, XP, or account details — only the
 * streak count and celebratory copy, which is safe to post publicly.
 */
export const ShareAchievementCard = forwardRef<View, ShareAchievementCardProps>(
  ({ streakDays, headline, subline }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.wrapper}>
        <LinearGradient
          colors={[colors.bgElevated, colors.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.badgeCircle}>
            <Text style={styles.flame}>🔥</Text>
          </View>
          <Text style={styles.streakNumber}>{streakDays}</Text>
          <Text style={styles.streakLabel}>DAYS</Text>

          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.subline}>{subline}</Text>

          <View style={styles.footer}>
            <Text style={styles.brand}>BlinkMoney</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);
ShareAchievementCard.displayName = "ShareAchievementCard";

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
  flame: { fontSize: 30 },
  streakNumber: {
    color: colors.gold,
    fontSize: 56,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.tight,
  },
  streakLabel: {
    color: colors.goldSoft,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.widest,
    marginTop: -spacing.xs,
  },
  headline: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    textAlign: "center",
    marginTop: spacing.xl,
    letterSpacing: letterSpacing.tight,
  },
  subline: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: fontSize.sm * 1.5,
  },
  footer: {
    marginTop: spacing.xxl,
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
