import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

interface StatCardProps {
  label: string;
  value: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  delta?: string;
}

export function StatCard({
  label,
  value,
  iconName,
  accentColor = colors.gold,
  delta,
}: StatCardProps) {
  return (
    <Card
      style={styles.card}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.headerRow}>
        {iconName ? (
          <View
            style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}
          >
            <Ionicons name={iconName} size={16} color={accentColor} />
          </View>
        ) : null}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      {delta ? <Text style={styles.delta}>{delta}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 96 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  label: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  value: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  delta: {
    color: colors.mint,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
});
