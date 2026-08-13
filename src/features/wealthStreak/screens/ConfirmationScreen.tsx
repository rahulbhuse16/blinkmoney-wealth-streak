import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useWealthContext } from "../hooks/useWealthContext";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatINR } from "@/utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList, "Confirmation">;
type Rt = RouteProp<RootStackParamList, "Confirmation">;

export default function ConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { amount } = route.params;
  const { profile, investToday } = useWealthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStreak = profile?.currentStreakDays ?? 0;
  const projectedStreak = profile?.streakBroken ? 1 : currentStreak + 1;

  async function handleConfirm() {
    if (isSubmitting) return; // guard against double taps triggering duplicate investments
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await investToday(amount);
      navigation.replace("InvestmentSuccess", { result });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Your investment wasn't completed.",
      );
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return <ConfirmingLoader amount={amount} />;
  }

  return (
    <View style={styles.screen}>
      <Header title="Confirm Investment" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Card style={styles.amountCard} elevated>
          <Text style={styles.amountLabel}>CONFIRM INVESTMENT</Text>
          <Text style={styles.amount}>{formatINR(amount)}</Text>
          <Text style={styles.amountCaption}>Today's wealth contribution</Text>
        </Card>

        <Card variant="outline" style={styles.streakCard}>
          <Text style={styles.streakCardLabel}>
            Your {currentStreak}-day streak will become:
          </Text>
          <View style={styles.streakRow}>
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.streakNumber}>{projectedStreak}</Text>
            <Text style={styles.streakUnit}>DAYS</Text>
          </View>
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label="Confirm Investment"
          onPress={handleConfirm}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
}

function ConfirmingLoader({ amount }: { amount: number }) {
  return (
    <View style={[styles.screen, styles.loaderScreen]}>
      <LoaderContent amount={amount} />
    </View>
  );
}

function LoaderContent({ amount }: { amount: number }) {
  return (
    <View
      style={styles.loaderContent}
      accessible
      accessibilityLabel="Updating your wealth journey"
    >
      <PulsingRing />
      <Text style={styles.loaderAmount}>{formatINR(amount)}</Text>
      <Text style={styles.loaderMessage}>Updating your wealth journey...</Text>
    </View>
  );
}

function PulsingRing() {
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={{
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 4,
        borderColor: colors.gold,
        transform: [{ scale }],
        opacity,
        marginBottom: spacing.xl,
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  amountCard: { alignItems: "center", paddingVertical: spacing.xxl },
  amountLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.4,
  },
  amount: {
    color: colors.gold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    marginTop: spacing.sm,
  },
  amountCaption: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  streakCard: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
  },
  streakCardLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  streakRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.xs },
  flame: { fontSize: 28 },
  streakNumber: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
  },
  streakUnit: {
    color: colors.goldSoft,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.errorSoft,
    borderRadius: 12,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, flex: 1 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loaderScreen: { alignItems: "center", justifyContent: "center" },
  loaderContent: { alignItems: "center" },
  loaderAmount: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  loaderMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    marginTop: spacing.sm,
  },
});
