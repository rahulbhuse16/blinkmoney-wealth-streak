import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CircleMember } from "../types";

import { ProgressBar } from "@/components/ProgressBar";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { truncateName } from "@/utils/format";

interface CircleProgressListProps {
  members: CircleMember[];
  durationDays: number;
}

export function CircleProgressList({
  members,
  durationDays,
}: CircleProgressListProps) {
  const joinedMembers = members.filter((m) => m.status !== "pending");

  return (
    <View>
      {joinedMembers.map((m) => (
        <View key={m.id} style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {truncateName(m.name, 12)}
            {m.isYou ? " (You)" : ""}
          </Text>
          <View style={styles.barWrap}>
            <ProgressBar
              progress={durationDays > 0 ? m.streakDays / durationDays : 0}
              height={8}
              fillColor={m.isYou ? colors.gold : colors.mint}
              accessibilityLabel={`${m.name}, ${m.streakDays} of ${durationDays} days`}
            />
          </View>
          <Text style={styles.value}>{m.streakDays}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  name: {
    width: 76,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  barWrap: { flex: 1, marginHorizontal: spacing.sm },
  value: {
    width: 28,
    textAlign: "right",
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});