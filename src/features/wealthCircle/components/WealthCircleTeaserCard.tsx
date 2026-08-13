import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

interface WealthCircleTeaserCardProps {
  hasCircle: boolean;
  onPress: () => void;
}

/**
 * Intentionally understated relative to the streak hero card — a single
 * compact row, not another full-width hero — so it reads as a natural
 * extension of the Wealth Streak experience rather than competing with it.
 */
export function WealthCircleTeaserCard({
  hasCircle,
  onPress,
}: WealthCircleTeaserCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasCircle ? "View your Wealth Circle" : "Create a Wealth Circle"
      }
    >
      <Card variant="outline" style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="people" size={20} color={colors.gold} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Build Together</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {hasCircle
              ? "Check in on your Wealth Circle's progress."
              : "You've built the habit. Now invite someone to build theirs with you."}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textTertiary}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${colors.gold}1f`,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.4,
  },
});