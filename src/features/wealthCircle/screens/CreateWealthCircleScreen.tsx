import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChallengeDurationSelector } from "../components/ChallengeDurationSelector";
import { wealthCircleService } from "../services/wealthCircleService";
import { ChallengeDuration, MAX_CIRCLE_FRIENDS } from "../types";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "CreateWealthCircle">;

export default function CreateWealthCircleScreen() {
  const navigation = useNavigation<Nav>();
  const [duration, setDuration] = useState<ChallengeDuration>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitRef = useRef(0);

  async function handleCreate() {
    // Guards against rapid double taps creating duplicate circles.
    const now = Date.now();
    if (isSubmitting || now - lastSubmitRef.current < 600) return;
    lastSubmitRef.current = now;

    if (!duration) {
      setError("Please choose a challenge duration.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const circle = await wealthCircleService.createWealthCircle(duration);
      navigation.replace("WealthCircleCreated", { circleId: circle.id });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't create your Wealth Circle. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <View style={[styles.screen, styles.loaderScreen]}>
        <PulsingRing />
        <Text style={styles.loaderText}>Creating your Wealth Circle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Create Wealth Circle" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Your Wealth Circle</Text>
        <Text style={styles.description}>
          Build a wealth habit together with people you trust.
        </Text>

        <Text style={styles.label}>Challenge duration</Text>
        <ChallengeDurationSelector selected={duration} onSelect={setDuration} />

        <Card style={styles.previewCard} elevated>
          <Text style={styles.previewFlame}>🔥</Text>
          <Text style={styles.previewTitle}>
            {duration}-Day Wealth Challenge
          </Text>
          <Text style={styles.previewDescription}>
            Everyone commits to showing up and building their investing habit.
          </Text>
          <View style={styles.previewDivider} />
          <View style={styles.membersRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.textTertiary}
            />
            <Text style={styles.membersText}>
              Members: You + up to {MAX_CIRCLE_FRIENDS} friends
            </Text>
          </View>
        </Card>

        {error ? (
          <View style={styles.errorRow}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Create & Invite"
          onPress={handleCreate}
          disabled={!duration}
        />
      </View>
    </View>
  );
}

/** Same pulsing-ring loader treatment used on ConfirmationScreen, reused here for visual consistency. */
function PulsingRing() {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
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
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: colors.gold,
        transform: [{ scale }],
        opacity,
        marginBottom: spacing.lg,
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
    lineHeight: fontSize.base * 1.4,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  previewCard: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.xl,
  },
  previewFlame: { fontSize: 30 },
  previewTitle: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    marginTop: spacing.xs,
  },
  previewDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: fontSize.sm * 1.4,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
    marginVertical: spacing.md,
  },
  membersRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  membersText: { color: colors.textTertiary, fontSize: fontSize.sm },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, flexShrink: 1 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  loaderScreen: { alignItems: "center", justifyContent: "center" },
  loaderText: { color: colors.textSecondary, fontSize: fontSize.base },
});