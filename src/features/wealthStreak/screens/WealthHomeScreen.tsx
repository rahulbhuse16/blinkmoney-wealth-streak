import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WEALTH_WALKTHROUGH_STEPS } from "../constants/walkthroughSteps";
import { useWealthContext } from "../hooks/useWealthContext";
import { wealthService } from "../services/wealthService";
import { Achievement } from "../types";

import { AchievementCard } from "@/components/AchievementCard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { StreakBadge } from "@/components/StreakBadge";
import {
  WalkthroughOverlay,
  useWalkthroughScroll,
  useWalkthroughState,
  useWalkthroughTargets,
} from "@/components/walkthrough";
import { WealthCircleTeaserCard } from "@/features/wealthCircle/components/WealthCircleTeaserCard";
import { wealthCircleService } from "@/features/wealthCircle/services/wealthCircleService";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";
import { formatINR, truncateName } from "@/utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList, "WealthHome">;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function WealthHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { profile, isLoading, error, loadProfile } = useWealthContext();

  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [achievementsError, setAchievementsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasWealthCircle, setHasWealthCircle] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Contextual walkthrough — in-memory only, never persisted.
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView>(null);
  const { setTargetRef, measureTarget } = useWalkthroughTargets();
  const { onScroll, ensureTargetVisible } = useWalkthroughScroll(scrollRef, {
    topInset: insets.top + spacing.xxl,
  });
  const walkthrough = useWalkthroughState(
    "wealthHome",
    WEALTH_WALKTHROUGH_STEPS.length,
  );
  const canRunWalkthrough =
    !isLoading && !error && !!profile && !profile.isFirstTimeUser;

  useEffect(() => {
    if (canRunWalkthrough) walkthrough.startOnce();
  }, [canRunWalkthrough, walkthrough]);

  const loadAchievements = useCallback(async () => {
    try {
      setAchievementsError(false);
      const data = await wealthService.getAchievements();
      setAchievements(data);
    } catch {
      setAchievementsError(true);
    }
  }, []);

  // Lightweight, best-effort check so the teaser CTA can say "View Circle"
  // instead of "Create" once one exists. Failure here is non-fatal — the
  // teaser simply falls back to its create-circle copy.
  const loadCircleStatus = useCallback(async () => {
    try {
      const circle = await wealthCircleService.getWealthCircle();
      setHasWealthCircle(!!circle);
    } catch {
      setHasWealthCircle(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadAchievements();
      loadCircleStatus();
    }, [loadProfile, loadAchievements, loadCircleStatus]),
  );

  React.useEffect(() => {
    if (!isLoading && profile) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, profile, fadeAnim]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadAchievements()]);
    setRefreshing(false);
  }, [loadProfile, loadAchievements]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={{ height: insets.top + spacing.md }} />
        <DashboardSkeleton />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View
        style={[
          styles.screen,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ErrorState
          title="Couldn't load your wealth journey."
          description="Check your connection and try again."
          onRetry={loadProfile}
        />
      </View>
    );
  }

  // First-time user experience — no fabricated completed achievements/progress.
  if (profile.isFirstTimeUser) {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + spacing.lg,
            paddingBottom: spacing.xxl,
          }}
          refreshControl={
            <RefreshControl
              tintColor={colors.gold}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>
              {truncateName(profile.userName)}
            </Text>
          </View>
          <EmptyState
            emoji="🌱"
            title="Your wealth journey starts today."
            description="Your first ₹21 starts your first streak."
            ctaLabel="Start Investing"
            onPressCta={() => navigation.navigate("Invest")}
          />
        </ScrollView>
      </View>
    );
  }

  const circleDestination = hasWealthCircle
    ? "WealthCircle"
    : "CreateWealthCircle";

  const milestoneProgress = profile.nextMilestone
    ? Math.min(1, profile.currentStreakDays / profile.nextMilestone.targetDays)
    : 1;
  const daysToMilestone = profile.nextMilestone
    ? Math.max(0, profile.nextMilestone.targetDays - profile.currentStreakDays)
    : 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.gold}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Animated.View
          style={{ opacity: fadeAnim, paddingHorizontal: spacing.lg }}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>
                {truncateName(profile.userName)}
              </Text>
            </View>
            <View
              style={styles.avatarCircle}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <Text style={styles.avatarInitial}>
                {profile.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionEyebrow}>YOUR WEALTH JOURNEY</Text>

          {/* Missed streak edge case */}
          {profile.streakBroken && profile.streakBrokenAtDays ? (
            <Card variant="outline" style={styles.missedStreakCard}>
              <Ionicons
                name="flame-outline"
                size={22}
                color={colors.textTertiary}
              />
              <Text style={styles.missedStreakTitle}>
                Your streak ended at {profile.streakBrokenAtDays} days.
              </Text>
              <Text style={styles.missedStreakSubtitle}>
                Your achievements and total wealth are still safe. Ready to
                start a new streak?
              </Text>
            </Card>
          ) : null}

          <View ref={setTargetRef("streak")} collapsable={false}>
            <Card style={styles.heroCard} elevated>
              <StreakBadge days={profile.currentStreakDays} size="hero" />
              {profile.nextMilestone ? (
                <View style={styles.milestoneProgressWrap}>
                  <View style={styles.milestoneProgressLabelRow}>
                    <Text style={styles.milestoneProgressLabel}>
                      {profile.currentStreakDays} /{" "}
                      {profile.nextMilestone.targetDays} days
                    </Text>
                    <Text style={styles.milestoneProgressLabel}>
                      {daysToMilestone === 0
                        ? "Milestone reached!"
                        : `${daysToMilestone} ${daysToMilestone === 1 ? "day" : "days"} to your next badge`}
                    </Text>
                  </View>
                  <ProgressBar progress={milestoneProgress} height={8} />
                </View>
              ) : null}
            </Card>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Total Invested"
              value={formatINR(profile.totalInvested)}
              iconName="wallet-outline"
              accentColor={colors.gold}
            />
            <StatCard
              label="Est. Growth"
              value={`+${formatINR(profile.estimatedGrowth)}`}
              iconName="trending-up-outline"
              accentColor={colors.mint}
              delta="+6.6%"
            />
            <View
              ref={setTargetRef("xp")}
              collapsable={false}
              style={styles.xpTargetWrap}
            >
              <StatCard
                label="Wealth XP"
                value={profile.currentXP.toLocaleString()}
                iconName="star-outline"
                accentColor={colors.info}
              />
            </View>
          </View>

          <View
            ref={setTargetRef("invest")}
            collapsable={false}
            style={styles.ctaWrap}
          >
            {profile.hasInvestedToday ? (
              <Card variant="subtle" style={styles.completeCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.mint}
                />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.completeTitle}>
                    Today's investment complete
                  </Text>
                  <Text style={styles.completeSubtitle}>
                    Your {profile.currentStreakDays}-day streak is safe. Come
                    back tomorrow.
                  </Text>
                </View>
              </Card>
            ) : (
              <Button
                label="Invest ₹21 Today"
                onPress={() => navigation.navigate("Invest")}
                icon={
                  <Ionicons name="flash" size={18} color={colors.textInverse} />
                }
              />
            )}
          </View>

          <WealthCircleTeaserCard
            hasCircle={hasWealthCircle}
            onPress={() => navigation.navigate(circleDestination)}
          />

          <View style={styles.quickLinksRow}>
            <QuickLink
              iconName="trophy-outline"
              label="Wealth Journey"
              onPress={() => navigation.navigate("WealthJourney")}
            />
            <QuickLink
              iconName="ribbon-outline"
              label="Achievements"
              onPress={() => navigation.navigate("Achievements")}
            />
          </View>
        </Animated.View>

        <View ref={setTargetRef("milestones")} collapsable={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View
              style={[
                styles.achievementsHeaderRow,
                { paddingHorizontal: spacing.lg },
              ]}
            >
              <Text style={styles.sectionTitle}>Your Achievements</Text>
              <Text
                style={styles.sectionLink}
                onPress={() => navigation.navigate("Achievements")}
              >
                See all
              </Text>
            </View>
          </Animated.View>

          {achievementsError ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <ErrorState
                compact
                title="Couldn't load achievements."
                onRetry={loadAchievements}
              />
            </View>
          ) : achievements === null ? (
            <View
              style={{
                paddingHorizontal: spacing.lg,
                flexDirection: "row",
                gap: spacing.md,
              }}
            >
              <View style={styles.achievementSkeleton} />
              <View style={styles.achievementSkeleton} />
            </View>
          ) : achievements.length === 0 ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EmptyState
                emoji="🏅"
                title="No achievements yet"
                description="Keep investing to unlock your first badge."
              />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.lg,
                gap: spacing.md,
              }}
            >
              {achievements.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  onPress={() => navigation.navigate("Achievements")}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <WalkthroughOverlay
        steps={WEALTH_WALKTHROUGH_STEPS}
        visible={walkthrough.isVisible && isFocused}
        currentStep={walkthrough.currentStep}
        measureTarget={measureTarget}
        ensureTargetVisible={ensureTargetVisible}
        onNext={walkthrough.next}
        onBack={walkthrough.back}
        onSkip={walkthrough.dismiss}
      />
    </View>
  );
}

function QuickLink({
  iconName,
  label,
  onPress,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1 }}
      hitSlop={4}
    >
      <Card variant="outline" style={styles.quickLinkCard}>
        <Ionicons name={iconName} size={20} color={colors.gold} />
        <Text style={styles.quickLinkLabel}>{label}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  centerContent: { alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevatedAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  avatarInitial: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  sectionEyebrow: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  missedStreakCard: { alignItems: "flex-start", marginBottom: spacing.md },
  missedStreakTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
    fontSize: fontSize.base,
  },
  missedStreakSubtitle: {
    color: colors.textTertiary,
    marginTop: 4,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  heroCard: { alignItems: "center", paddingVertical: spacing.xl },
  milestoneProgressWrap: { width: "100%", marginTop: spacing.lg },
  milestoneProgressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  milestoneProgressLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  ctaWrap: { marginTop: spacing.lg },
  xpTargetWrap: { flex: 1 },
  completeCard: { flexDirection: "row", alignItems: "center" },
  completeTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  completeSubtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  quickLinksRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  quickLinkCard: { flex: 1, alignItems: "center", paddingVertical: spacing.md },
  quickLinkLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  achievementsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  sectionLink: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  achievementSkeleton: {
    width: 168,
    height: 148,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevatedAlt,
  },
});
