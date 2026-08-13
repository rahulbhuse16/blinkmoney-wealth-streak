import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MemberStatus } from "../types";

import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

const STATUS_META: Record<
  MemberStatus,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active today", color: colors.mint, bg: `${colors.mint}22` },
  inactive: {
    label: "Not active today",
    color: colors.textTertiary,
    bg: colors.bgElevatedAlt,
  },
  joined: { label: "Joined", color: colors.info, bg: `${colors.info}22` },
  pending: {
    label: "Invitation pending",
    color: colors.gold,
    bg: `${colors.gold}1f`,
  },
};

export function CircleStatusBadge({ status }: { status: MemberStatus }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});