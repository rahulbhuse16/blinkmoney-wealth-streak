import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { wealthCircleService } from "../services/wealthCircleService";
import { WealthCircle } from "../types";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfettiBurst } from "@/features/wealthStreak/components/ConfettiBurst";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, letterSpacing, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "WealthCircleCreated">;
type Rt = RouteProp<RootStackParamList, "WealthCircleCreated">;

export default function WealthCircleCreatedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const [circle, setCircle] = useState<WealthCircle | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  const emojiScale = useRef(new Animated.Value(0)).current;
  const cardEntrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    wealthCircleService.getWealthCircle().then((c) => {
      if (isMounted) setCircle(c);
    });
    return () => {
      isMounted = false;
    };
  }, [route.params.circleId]);

  useEffect(() => {
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
    const timer = setTimeout(() => setShowConfetti(false), 2200);
    return () => clearTimeout(timer);
  }, [cardEntrance, emojiScale]);

  function goToInvite() {
    navigation.navigate("InviteFriends");
  }

  function goToCircle() {
    // Replace so the created/loading screen isn't in the back stack.
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "WealthCircle" }] }),
    );
  }

  return (
    <View style={styles.screen}>
      <ConfettiBurst active={showConfetti} />
      <View style={styles.content}>
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
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>YOUR WEALTH CIRCLE{"\n"}IS READY</Text>

          <Card style={styles.challengeCard} elevated>
            <Text style={styles.challengeName}>
              {circle?.name ?? "Wealth Challenge"}
            </Text>
            <Text style={styles.challengeCopy}>You're the first member.</Text>
            <Text style={styles.challengeCopy}>
              Now invite your friends to join you.
            </Text>
          </Card>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Invite Friends"
          onPress={goToInvite}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label="View Circle" variant="secondary" onPress={goToCircle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  celebrationEmoji: { fontSize: 56, marginBottom: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    textAlign: "center",
    letterSpacing: letterSpacing.wide,
    lineHeight: fontSize.xl * 1.25,
  },
  challengeCard: {
    alignItems: "center",
    marginTop: spacing.xl,
    width: 300,
    paddingVertical: spacing.xl,
  },
  challengeName: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  challengeCopy: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});