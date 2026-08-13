import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { wealthService } from "../services/wealthService";
import { JourneyData, Milestone } from "../types";

import { Card } from "@/components/Card";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { SkeletonBlock } from "@/components/LoadingSkeleton";
import { XPProgress } from "@/components/XPProgress";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "WealthJourney">;

export default function WealthJourneyScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wealthService.getJourney();
      setJourney(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't load your wealth journey.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.screen}>
      <Header title="Wealth Journey" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={{ padding: spacing.lg }}>
          <SkeletonBlock height={100} borderRadius={radius.lg} />
          <SkeletonBlock
            height={80}
            borderRadius={radius.lg}
            style={{ marginTop: spacing.md }}
          />
          <SkeletonBlock
            height={80}
            borderRadius={radius.lg}
            style={{ marginTop: spacing.md }}
          />
          <SkeletonBlock
            height={80}
            borderRadius={radius.lg}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : error || !journey ? (
        <View style={styles.center}>
          <ErrorState
            title="Couldn't load your wealth journey."
            onRetry={load}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl,
          }}
        >
          <Card style={styles.levelCard} elevated>
            <Text style={styles.levelBig}>LEVEL {journey.level}</Text>
            <Text style={styles.levelTitle}>
              {journey.levelTitle.toUpperCase()}
            </Text>
            <View style={{ marginTop: spacing.lg, width: "100%" }}>
              <XPProgress
                level={journey.level}
                currentXP={journey.currentXP}
                xpForCurrentLevel={journey.xpForCurrentLevel}
                xpForNextLevel={journey.xpForNextLevel}
              />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.timeline}>
            {journey.milestones.map((m, idx) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                isLast={idx === journey.milestones.length - 1}
                onPress={() => setSelectedMilestone(m)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={!!selectedMilestone}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedMilestone(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedMilestone(null)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
          >
            {selectedMilestone ? (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalIcon}>{selectedMilestone.icon}</Text>
                <Text style={styles.modalTitle}>{selectedMilestone.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedMilestone.description}
                </Text>
                <View style={styles.modalStatusRow}>
                  <StatusPill status={selectedMilestone.status} />
                </View>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedMilestone(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MilestoneRow({
  milestone,
  isLast,
  onPress,
}: {
  milestone: Milestone;
  isLast: boolean;
  onPress: () => void;
}) {
  const { status } = milestone;
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked" && !isCurrent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${milestone.title}, ${status}`}
      style={styles.milestoneRow}
    >
      <View style={styles.milestoneLeftCol}>
        <View
          style={[
            styles.milestoneDot,
            isCompleted && styles.milestoneDotCompleted,
            isCurrent && styles.milestoneDotCurrent,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={14} color={colors.textInverse} />
          ) : (
            <Text style={styles.milestoneDotEmoji}>{milestone.icon}</Text>
          )}
        </View>
        {!isLast ? (
          <View
            style={[styles.connector, isCompleted && styles.connectorCompleted]}
          />
        ) : null}
      </View>
      <Card
        variant={isLocked ? "outline" : "default"}
        style={StyleSheet.flatten([
          styles.milestoneCard,
          isCurrent && styles.milestoneCardCurrent,
          isLocked && styles.milestoneCardLocked,
        ])}
      >
        <Text style={[styles.milestoneTitle, isLocked && styles.textLocked]}>
          {milestone.title}
        </Text>
        {isCompleted ? (
          <Text style={styles.milestoneStatusText}>Completed</Text>
        ) : (
          <Text
            style={[styles.milestoneStatusText, isLocked && styles.textLocked]}
          >
            {milestone.description}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

function StatusPill({ status }: { status: Milestone["status"] }) {
  const label =
    status === "completed"
      ? "Completed"
      : status === "current"
        ? "In Progress"
        : "Locked";
  const color =
    status === "completed"
      ? colors.mint
      : status === "current"
        ? colors.gold
        : colors.lockedText;
  return (
    <View style={[styles.statusPill, { borderColor: color }]}>
      <Text style={[styles.statusPillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  levelCard: { alignItems: "center", paddingVertical: spacing.xl },
  levelBig: {
    color: colors.gold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  levelTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  timeline: {},
  milestoneRow: { flexDirection: "row" },
  milestoneLeftCol: { alignItems: "center", width: 40 },
  milestoneDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.locked,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneDotCompleted: { backgroundColor: colors.mint },
  milestoneDotCurrent: {
    backgroundColor: colors.bgElevatedAlt,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  milestoneDotEmoji: { fontSize: 14 },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.locked,
    marginVertical: 4,
    minHeight: 24,
  },
  connectorCompleted: { backgroundColor: colors.mintDeep },
  milestoneCard: {
    flex: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
    paddingVertical: spacing.md,
  },
  milestoneCardCurrent: { borderWidth: 1, borderColor: colors.gold },
  milestoneCardLocked: { opacity: 0.7 },
  milestoneTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  milestoneStatusText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  textLocked: { color: colors.lockedText },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    alignItems: "center",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  modalIcon: { fontSize: 44 },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  modalStatusRow: { marginTop: spacing.md },
  statusPill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
  },
  modalCloseButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});
