import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CircleStatusBadge } from "./CircleStatusBadge";
import { CircleMember } from "../types";

import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";
import { truncateName } from "@/utils/format";

interface CircleMemberRowProps {
  member: CircleMember;
  onSimulateJoin?: (member: CircleMember) => void;
  isSimulating?: boolean;
}

export function CircleMemberRow({
  member,
  onSimulateJoin,
  isSimulating,
}: CircleMemberRowProps) {
  const { name, status, streakDays, isYou } = member;
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${name}, ${status}`}
    >
      <View style={[styles.avatar, isYou && styles.avatarYou]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {truncateName(name, 20)}
          {isYou ? " (You)" : ""}
        </Text>
        {status === "pending" ? (
          <CircleStatusBadge status="pending" />
        ) : (
          <View style={styles.streakRow}>
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.streakText}>{streakDays}</Text>
            <View style={{ marginLeft: spacing.xs }}>
              <CircleStatusBadge status={status} />
            </View>
          </View>
        )}
      </View>

      {status === "pending" && onSimulateJoin ? (
        <Pressable
          onPress={() => onSimulateJoin(member)}
          disabled={isSimulating}
          accessibilityRole="button"
          accessibilityLabel={`Simulate ${name} joining (demo)`}
          style={({ pressed }) => [
            styles.simulateButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevatedAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  avatarYou: { borderColor: colors.gold },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  info: { flex: 1, marginLeft: spacing.sm },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  streakRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  flame: { fontSize: 12 },
  streakText: {
    color: colors.goldSoft,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginLeft: 2,
  },
  simulateButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: `${colors.gold}1a`,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
});