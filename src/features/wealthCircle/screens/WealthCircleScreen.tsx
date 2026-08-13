import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CircleMemberRow } from "../components/CircleMemberRow";
import { CircleProgressList } from "../components/CircleProgressList";
import { CircleShareCard } from "../components/CircleShareCard";
import { getIsCircleFull } from "../mock/mockData";
import { wealthCircleService } from "../services/wealthCircleService";
import { CircleMember, WealthCircle } from "../types";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { SkeletonBlock } from "@/components/LoadingSkeleton";
import { ProgressBar } from "@/components/ProgressBar";
import { ConfettiBurst } from "@/features/wealthStreak/components/ConfettiBurst";
import { shareService } from "@/features/wealthStreak/services/shareService";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "WealthCircle">;

export default function WealthCircleScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [circle, setCircle] = useState<WealthCircle | null | undefined>(
    undefined,
  ); // undefined = not yet loaded
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningMemberId, setJoiningMemberId] = useState<string | null>(null);
  const [joinCelebration, setJoinCelebration] = useState<CircleMember | null>(
    null,
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareCardRef = useRef<View>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await wealthCircleService.getWealthCircle();
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setCircle(data);
    } catch (e) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setError(
        e instanceof Error ? e.message : "Couldn't load your Wealth Circle.",
      );
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSimulateJoin(member: CircleMember) {
    if (joiningMemberId) return; // prevent overlapping join simulations
    setJoiningMemberId(member.id);
    try {
      await wealthCircleService.simulateMemberJoin(member.id);
      const refreshed = await wealthCircleService.getWealthCircle();
      if (!isMountedRef.current) return;
      setCircle(refreshed);
      setJoinCelebration(member);
      celebrationAnim.setValue(0);
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMountedRef.current) setJoinCelebration(null);
      });
    } catch {
      // Best-effort demo action — a failure here just means the row stays pending.
    } finally {
      if (isMountedRef.current) setJoiningMemberId(null);
    }
  }

  async function handleShareCompletion() {
    if (isSharing || !circle) return;
    setIsSharing(true);
    try {
      const friendCount = circle.members.filter((m) => !m.isYou).length;
      await shareService.shareAchievementImage(
        shareCardRef,
        `🏆 ${circle.durationDays} DAYS\n\nWe built the habit.\n\n${friendCount} friends. 1 challenge. ${circle.durationDays} days.\n\nBlinkMoney`,
      );
    } finally {
      if (isMountedRef.current) setIsSharing(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Header title="Wealth Circle" onBack={() => navigation.goBack()} />
        <View style={{ padding: spacing.lg }}>
          <SkeletonBlock height={90} borderRadius={radius.lg} />
          <SkeletonBlock
            height={220}
            borderRadius={radius.lg}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Header title="Wealth Circle" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ErrorState
            title="Couldn't load your Wealth Circle."
            onRetry={load}
          />
        </View>
      </View>
    );
  }

  if (!circle) {
    return (
      <View style={styles.screen}>
        <Header title="Wealth Circle" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <EmptyState
            emoji="👥"
            title="You don't have a Wealth Circle yet"
            description="Create one to start a challenge with your friends."
            ctaLabel="Create Wealth Circle"
            onPressCta={() => navigation.navigate("CreateWealthCircle")}
          />
        </View>
      </View>
    );
  }

  const isFull = getIsCircleFull(circle);
  const activeToday = circle.members.filter(
    (m) => m.status === "active",
  ).length;
  const overallProgress = Math.min(1, circle.currentDay / circle.durationDays);
  const friendsJoinedCount = circle.members.filter(
    (m) => !m.isYou && m.status !== "pending",
  ).length;
  const isCompleted = circle.status === "completed";

  return (
    <View style={styles.screen}>
      {isCompleted ? <ConfettiBurst active={showConfetti} /> : null}
      <Header title="Wealth Circle" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isCompleted ? (
          <CompletionCelebration
            circle={circle}
            onShare={handleShareCompletion}
            isSharing={isSharing}
            onMount={() => setShowConfetti(true)}
          />
        ) : (
          <Card style={styles.headerCard} elevated>
            <Text style={styles.challengeName}>
              🔥 {circle.durationDays} DAY CHALLENGE
            </Text>
            <Text style={styles.dayLabel}>
              DAY {circle.currentDay} OF {circle.durationDays}
            </Text>
            <ProgressBar
              progress={overallProgress}
              height={10}
              style={{ marginTop: spacing.sm }}
              accessibilityLabel={`Day ${circle.currentDay} of ${circle.durationDays}`}
            />
            <Text style={styles.activeTodayText}>
              {activeToday} of {circle.members.length} members active today
            </Text>
          </Card>
        )}

        {joinCelebration ? (
          <Animated.View
            style={[
              styles.celebrationBanner,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    translateY: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>
              {joinCelebration.name} joined your Wealth Circle!{"\n"}Your
              challenge starts now.
            </Text>
          </Animated.View>
        ) : null}

        <Text style={styles.sectionTitle}>{circle.members.length} Members</Text>
        <Card style={styles.membersCard}>
          {circle.members.map((m) => (
            <CircleMemberRow
              key={m.id}
              member={m}
              onSimulateJoin={handleSimulateJoin}
              isSimulating={joiningMemberId === m.id}
            />
          ))}
        </Card>

        {circle.members.filter((m) => !m.isYou).length === 0 ? (
          <View style={styles.emptyCircleWrap}>
            <EmptyState
              emoji="👥"
              title="Your Wealth Circle is waiting."
              description="Invite friends to start the challenge together."
              ctaLabel="Invite Friends"
              onPressCta={() => navigation.navigate("InviteFriends")}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Circle Progress</Text>
            <Card style={styles.progressCard}>
              <CircleProgressList
                members={circle.members}
                durationDays={circle.durationDays}
              />
            </Card>
          </>
        )}

        {!isCompleted ? (
          isFull ? (
            <Card variant="subtle" style={styles.fullNotice}>
              <Ionicons name="people" size={20} color={colors.textTertiary} />
              <Text style={styles.fullNoticeText}>
                Your Wealth Circle is full. You already have 5 friends in this
                challenge.
              </Text>
            </Card>
          ) : (
            <View style={{ marginTop: spacing.lg }}>
              <Button
                label={
                  friendsJoinedCount === 0
                    ? "Invite Friends"
                    : "Invite More Friends"
                }
                variant="secondary"
                onPress={() => navigation.navigate("InviteFriends")}
                icon={
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color={colors.textPrimary}
                  />
                }
              />
            </View>
          )
        ) : null}

        {/* Off-screen capture target for the completion share card */}
        <View style={styles.hiddenCaptureWrap} pointerEvents="none">
          <CircleShareCard
            ref={shareCardRef}
            durationDays={circle.durationDays}
            friendCount={circle.members.filter((m) => !m.isYou).length}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function CompletionCelebration({
  circle,
  onShare,
  isSharing,
  onMount,
}: {
  circle: WealthCircle;
  onShare: () => void;
  isSharing: boolean;
  onMount: () => void;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const friendCount = circle.members.filter((m) => !m.isYou).length;

  React.useEffect(() => {
    onMount();
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 12,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            scale: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      }}
    >
      <Card style={styles.completionCard} elevated>
        <Text style={styles.completionTrophy}>🏆</Text>
        <Text style={styles.completionTitle}>CIRCLE COMPLETE</Text>
        <Text style={styles.completionDays}>
          {circle.durationDays} DAYS{"\n"}OF SHOWING UP
        </Text>
        <Text style={styles.completionCopy}>
          You and {friendCount} {friendCount === 1 ? "friend" : "friends"}{" "}
          completed the challenge.
        </Text>
        <Text style={styles.completionShowedUp}>🔥 Everyone showed up.</Text>
        <Button
          label="Share Achievement"
          onPress={onShare}
          loading={isSharing}
          style={{ marginTop: spacing.lg }}
        />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: { paddingVertical: spacing.lg },
  challengeName: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  dayLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  activeTodayText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  celebrationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevatedAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  celebrationEmoji: { fontSize: 24 },
  celebrationText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 1,
    lineHeight: fontSize.sm * 1.4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  membersCard: { paddingVertical: spacing.sm },
  emptyCircleWrap: { marginTop: spacing.sm },
  progressCard: {},
  fullNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  fullNoticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: fontSize.sm * 1.4,
  },
  hiddenCaptureWrap: { position: "absolute", top: -9999, left: -9999 },
  completionCard: { alignItems: "center", paddingVertical: spacing.xxl },
  completionTrophy: { fontSize: 44 },
  completionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.4,
    marginTop: spacing.sm,
  },
  completionDays: {
    color: colors.gold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: fontSize.xl * 1.2,
  },
  completionCopy: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.md,
  },
  completionShowedUp: {
    color: colors.mint,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
});