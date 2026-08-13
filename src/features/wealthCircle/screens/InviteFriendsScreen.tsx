import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getIsCircleFull, getRemainingFriendSlots } from "../mock/mockData";
import { wealthCircleService } from "../services/wealthCircleService";
import { CircleMember, WealthCircle } from "../types";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { shareService } from "@/features/wealthStreak/services/shareService";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "InviteFriends">;

const MOCK_INVITE_LINK = "https://blinkmoney.app/dev/circle-invite/abc123"; // dev/mock link — a real referral token/URL plugs in here

export default function InviteFriendsScreen() {
  const navigation = useNavigation<Nav>();
  const [circle, setCircle] = useState<WealthCircle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastInviteRef = useRef(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const c = await wealthCircleService.getWealthCircle();
      setCircle(c);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const isFull = circle ? getIsCircleFull(circle) : false;
  const remainingSlots = circle ? getRemainingFriendSlots(circle) : 0;
  const pendingMembers =
    circle?.members.filter((m) => m.status === "pending") ?? [];

  async function handleInvite() {
    const now = Date.now();
    if (isInviting || now - lastInviteRef.current < 500) return; // debounce rapid taps
    lastInviteRef.current = now;

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name to invite.");
      return;
    }
    if (isFull) {
      setError(
        "Your Wealth Circle is full. You already have 5 friends in this challenge.",
      );
      return;
    }

    setIsInviting(true);
    setError(null);
    try {
      const member = await wealthCircleService.inviteMember(trimmed);
      const refreshed = await wealthCircleService.getWealthCircle();
      setCircle(refreshed);
      setName("");
      Keyboard.dismiss();
      await sendInviteShare(member);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't send the invitation.",
      );
    } finally {
      setIsInviting(false);
    }
  }

  async function sendInviteShare(member: CircleMember) {
    const duration = circle?.durationDays ?? 30;
    const message = `Build your wealth habit with me 🔥\n\nI'm starting a ${duration}-Day Wealth Challenge on BlinkMoney.\n\nJoin my Wealth Circle, ${member.name}:\n${MOCK_INVITE_LINK}`;
    await shareService.shareText(message);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <Header title="Invite Friends" onBack={() => navigation.goBack()} />

      {isLoading ? null : !circle ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            emoji="👥"
            title="No Wealth Circle yet"
            description="Create a Wealth Circle first, then invite your friends."
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Invite up to {remainingSlots} more{" "}
            {remainingSlots === 1 ? "friend" : "friends"} to your {circle.name}.
          </Text>

          {isFull ? (
            <Card variant="subtle" style={styles.fullNotice}>
              <Ionicons name="people" size={20} color={colors.textTertiary} />
              <Text style={styles.fullNoticeText}>
                Your Wealth Circle is full. You already have 5 friends in this
                challenge.
              </Text>
            </Card>
          ) : (
            <>
              <View style={styles.inputRow}>
                <TextInput
                  value={name}
                  onChangeText={(t) => {
                    setError(null);
                    setName(t);
                  }}
                  placeholder="Friend's name"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={handleInvite}
                  accessibilityLabel="Friend's name"
                  maxLength={40}
                />
              </View>
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
              <Button
                label="Send Invite"
                onPress={handleInvite}
                loading={isInviting}
                style={{ marginTop: spacing.md }}
                icon={
                  <Ionicons
                    name="paper-plane-outline"
                    size={16}
                    color={colors.textInverse}
                  />
                }
              />
            </>
          )}

          {pendingMembers.length > 0 ? (
            <View style={styles.pendingSection}>
              <Text style={styles.sectionTitle}>Invite sent ✓</Text>
              {pendingMembers.map((m) => (
                <Text key={m.id} style={styles.pendingLine}>
                  Waiting for {m.name} to join your Wealth Circle.
                </Text>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}

      {circle ? (
        <View style={styles.footer}>
          <Button
            label="Done"
            variant="secondary"
            onPress={() => navigation.navigate("WealthCircle")}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.4,
  },
  inputRow: {
    marginTop: spacing.lg,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, flexShrink: 1 },
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
  pendingSection: { marginTop: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  pendingLine: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});