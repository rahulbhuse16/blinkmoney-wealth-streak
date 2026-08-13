import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useWealthContext } from "../hooks/useWealthContext";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import {
  INVESTMENT_PRESETS,
  MAX_INVESTMENT_AMOUNT,
  MIN_INVESTMENT_AMOUNT,
} from "@/constants/investment";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";
import { formatINR } from "@/utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList, "Invest">;

export default function InvestScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useWealthContext();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(21);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const amount = useMemo(() => {
    if (showCustom) {
      const parsed = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return selectedPreset ?? 0;
  }, [showCustom, customAmount, selectedPreset]);

  const currentStreak = profile?.currentStreakDays ?? 0;
  const projectedStreak = profile?.streakBroken ? 1 : currentStreak + 1;
  const alreadyInvested = profile?.hasInvestedToday ?? false;

  function handleSelectPreset(preset: number) {
    setValidationError(null);
    setShowCustom(false);
    setSelectedPreset(preset);
    Keyboard.dismiss();
  }

  function handleSelectCustom() {
    setValidationError(null);
    setShowCustom(true);
    setSelectedPreset(null);
  }

  function validate(): boolean {
    if (!amount || Number.isNaN(amount)) {
      setValidationError("Please enter a valid amount.");
      return false;
    }
    if (amount < MIN_INVESTMENT_AMOUNT) {
      setValidationError(
        `Minimum investment amount is ${formatINR(MIN_INVESTMENT_AMOUNT)}.`,
      );
      return false;
    }
    if (amount > MAX_INVESTMENT_AMOUNT) {
      setValidationError(
        `Maximum investment amount is ${formatINR(MAX_INVESTMENT_AMOUNT)}.`,
      );
      return false;
    }
    setValidationError(null);
    return true;
  }

  function handleContinue() {
    if (!validate()) return;
    navigation.navigate("Confirmation", { amount });
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <Header title="Invest Today" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {alreadyInvested ? (
          <Card variant="subtle" style={styles.noticeCard}>
            <Ionicons name="checkmark-circle" size={22} color={colors.mint} />
            <Text style={styles.noticeText}>
              You've already invested today. Investing again won't be reflected
              until tomorrow's streak.
            </Text>
          </Card>
        ) : null}

        <Text style={styles.label}>Choose an amount</Text>
        <View style={styles.presetGrid}>
          {INVESTMENT_PRESETS.map((preset) => {
            const isSelected = !showCustom && selectedPreset === preset;
            return (
              <Pressable
                key={preset}
                onPress={() => handleSelectPreset(preset)}
                accessibilityRole="button"
                accessibilityLabel={`Invest ${formatINR(preset)}`}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.presetChip,
                  isSelected && styles.presetChipSelected,
                  pressed && styles.presetChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isSelected && styles.presetChipTextSelected,
                  ]}
                >
                  {formatINR(preset)}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={handleSelectCustom}
            accessibilityRole="button"
            accessibilityLabel="Enter a custom amount"
            accessibilityState={{ selected: showCustom }}
            style={({ pressed }) => [
              styles.presetChip,
              styles.customChip,
              showCustom && styles.presetChipSelected,
              pressed && styles.presetChipPressed,
            ]}
          >
            <Text
              style={[
                styles.presetChipText,
                showCustom && styles.presetChipTextSelected,
              ]}
            >
              Custom
            </Text>
          </Pressable>
        </View>

        {showCustom ? (
          <View style={styles.customInputWrap}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              value={customAmount}
              onChangeText={(t) => {
                setValidationError(null);
                setCustomAmount(t.replace(/[^0-9]/g, ""));
              }}
              keyboardType="number-pad"
              placeholder="Enter amount"
              placeholderTextColor={colors.textTertiary}
              style={styles.customInput}
              maxLength={7}
              accessibilityLabel="Custom investment amount"
              returnKeyType="done"
            />
          </View>
        ) : null}

        {validationError ? (
          <View style={styles.errorRow}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.error}
            />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Today's investment</Text>
            <Text style={styles.summaryValue}>{formatINR(amount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current streak</Text>
            <Text style={styles.streakInline}>🔥 {currentStreak} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>After investment</Text>
            <Text style={[styles.streakInline, styles.streakInlineHighlight]}>
              🔥 {projectedStreak} days
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!amount} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: fontSize.sm * 1.4,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  presetChip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: "30%",
    alignItems: "center",
  },
  customChip: { minWidth: "30%" },
  presetChipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.bgElevatedAlt,
  },
  presetChipPressed: { opacity: 0.8 },
  presetChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  presetChipTextSelected: { color: colors.gold },
  customInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginRight: spacing.xs,
  },
  customInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    paddingVertical: spacing.md,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, flexShrink: 1 },
  summaryCard: { marginTop: spacing.xl },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  summaryLabel: { color: colors.textTertiary, fontSize: fontSize.sm },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  streakInline: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  streakInlineHighlight: { color: colors.gold },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
