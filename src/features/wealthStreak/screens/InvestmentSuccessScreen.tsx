import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

import { ConfettiBurst } from "../components/ConfettiBurst";
import { ShareAchievementCard } from "../components/ShareAchievementCard";
import { shareService } from "../services/shareService";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { useCountUp } from "@/hooks/useCountUp";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, letterSpacing, spacing } from "@/theme";
import { formatINR } from "@/utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList, "InvestmentSuccess">;
type Rt = RouteProp<RootStackParamList, "InvestmentSuccess">;

export default function InvestmentSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { result } = route.params;

  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const emojiScale = useRef(new Animated.Value(0)).current;
  const cardEntrance = useRef(new Animated.Value(0)).current;
  const milestoneScale = useRef(
    new Animated.Value(result.milestoneUnlocked ? 0 : 1),
  ).current;

  const displayXP = useCountUp(result.xpEarned, 700);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    Animated.spring(emojiScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 14,
    }).start();
    Animated.timing(cardEntrance, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();

    if (result.milestoneUnlocked) {
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(milestoneScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 6,
          bounciness: 16,
        }),
      ]).start();
    }

    const timer = setTimeout(() => setShowConfetti(false), 2400);
    return () => clearTimeout(timer);
  }, [cardEntrance, emojiScale, milestoneScale, result.milestoneUnlocked]);

  const milestoneProgress =
    result.nextMilestone && result.daysUntilNextMilestone != null
      ? Math.min(1, result.newStreakDays / result.nextMilestone.targetDays)
      : 1;

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await shareService.shareAchievementImage(
        shareCardRef,
        `🔥 ${result.newStreakDays} DAYS\n\nI built the habit. ${result.newStreakDays} days of showing up.\n\nBlinkMoney`,
      );
    } finally {
      setIsSharing(false);
    }
  }

  function handleContinue() {
    // Reset the stack back to Home so the back button/gesture can't replay the success screen.
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "WealthHome" }] }),
    );
  }

  return (
    <View style={styles.screen}>
      <ConfettiBurst active={showConfetti} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ alignItems: "center", transform: [{ scale: emojiScale }] }}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardEntrance,
            transform: [
              {
                translateY: cardEntrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.title}>INVESTMENT COMPLETE</Text>
          <Text style={styles.amount}>{formatINR(result.amount)}</Text>

          <Card style={styles.streakCard} elevated>
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.streakNumber}>
              {result.newStreakDays} DAY STREAK
            </Text>
          </Card>

          <Card variant="outline" style={styles.xpCard}>
            <View style={styles.xpRow}>
              <Text style={styles.xpIcon}>✨</Text>
              <Text style={styles.xpText}>+{displayXP} Wealth XP</Text>
            </View>
          </Card>

          {result.nextMilestone &&
          result.daysUntilNextMilestone != null &&
          result.daysUntilNextMilestone > 0 ? (
            <Card variant="subtle" style={styles.milestoneCard}>
              <View style={styles.milestoneHeaderRow}>
                <Text style={styles.milestoneIcon}>
                  {result.nextMilestone.icon}
                </Text>
                <Text style={styles.milestoneText}>
                  {result.daysUntilNextMilestone}{" "}
                  {result.daysUntilNextMilestone === 1 ? "day" : "days"} until
                  {"\n"}
                  <Text style={styles.milestoneTextBold}>
                    {result.nextMilestone.title}
                  </Text>
                </Text>
              </View>
              <ProgressBar
                progress={milestoneProgress}
                height={8}
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          ) : null}

          {result.milestoneUnlocked ? (
            <Animated.View style={{ transform: [{ scale: milestoneScale }] }}>
              <Card style={styles.unlockedCard} elevated>
                <Text style={styles.unlockedIcon}>
                  {result.milestoneUnlocked.icon}
                </Text>
                <Text style={styles.unlockedTitle}>Milestone Unlocked!</Text>
                <Text style={styles.unlockedSubtitle}>
                  {result.milestoneUnlocked.title}
                </Text>
              </Card>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* Off-screen capture target for the shareable card */}
        <View style={styles.hiddenCaptureWrap} pointerEvents="none">
          <ShareAchievementCard
            ref={shareCardRef}
            streakDays={result.newStreakDays}
            headline="I BUILT THE HABIT."
            subline={`${result.newStreakDays} days of showing up.`}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Share Achievement"
          variant="secondary"
          onPress={handleShare}
          loading={isSharing}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  celebrationEmoji: { fontSize: 56, marginBottom: spacing.sm },
  title: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.widest,
    textAlign: "center",
  },
  amount: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  streakCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginTop: spacing.xl,
    width: 320,
  },
  flame: { fontSize: 32 },
  streakNumber: {
    color: colors.gold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    marginTop: spacing.xs,
    letterSpacing: letterSpacing.wide,
  },
  xpCard: {
    alignItems: "center",
    marginTop: spacing.md,
    width: 320,
    paddingVertical: spacing.md,
  },
  xpRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  xpIcon: { fontSize: 18 },
  xpText: {
    color: colors.mint,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  milestoneCard: { marginTop: spacing.md, width: 320 },
  milestoneHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  milestoneIcon: { fontSize: 24 },
  milestoneText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: fontSize.sm * 1.4,
  },
  milestoneTextBold: { color: colors.textPrimary, fontWeight: fontWeight.bold },
  unlockedCard: {
    alignItems: "center",
    marginTop: spacing.md,
    width: 320,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  unlockedIcon: { fontSize: 40 },
  unlockedTitle: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    marginTop: spacing.sm,
    letterSpacing: letterSpacing.wide,
  },
  unlockedSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  hiddenCaptureWrap: { position: "absolute", top: -9999, left: -9999 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
