import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CHALLENGE_DURATIONS, ChallengeDuration } from "../types";

import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

interface ChallengeDurationSelectorProps {
  selected: ChallengeDuration | null;
  onSelect: (duration: ChallengeDuration) => void;
}

export function ChallengeDurationSelector({
  selected,
  onSelect,
}: ChallengeDurationSelectorProps) {
  return (
    <View style={styles.row}>
      {CHALLENGE_DURATIONS.map((duration) => {
        const isSelected = selected === duration;
        return (
          <Pressable
            key={duration}
            onPress={() => onSelect(duration)}
            accessibilityRole="button"
            accessibilityLabel={`${duration} day challenge`}
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text
              style={[styles.chipValue, isSelected && styles.chipValueSelected]}
            >
              {duration}
            </Text>
            <Text
              style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
            >
              Days
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.bgElevatedAlt,
  },
  chipPressed: { opacity: 0.8 },
  chipValue: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  chipValueSelected: { color: colors.gold },
  chipLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
    letterSpacing: 0.6,
  },
  chipLabelSelected: { color: colors.goldSoft },
});