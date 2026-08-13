import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import { useCountUp } from "@/hooks/useCountUp";
import { colors, fontSize, fontWeight, letterSpacing, spacing } from "@/theme";

interface StreakBadgeProps {
  days: number;
  size?: "lg" | "hero";
  animateEntrance?: boolean;
  label?: string;
}

/**
 * The signature visual element of the app: a large animated flame + streak
 * count. Uses a subtle looping pulse (not spin/bounce) to feel alive without
 * being cartoonish.
 */
export function StreakBadge({
  days,
  size = "hero",
  animateEntrance = true,
  label = "DAY STREAK",
}: StreakBadgeProps) {
  const displayDays = useCountUp(days);
  const pulse = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(animateEntrance ? 0 : 1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (animateEntrance) {
      Animated.spring(entrance, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 10,
      }).start();
    }
  }, [animateEntrance, entrance]);

  const isHero = size === "hero";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entrance,
          transform: [
            {
              scale: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${days} day streak`}
    >
      <Animated.Text
        style={[
          isHero ? styles.flameHero : styles.flameLg,
          { transform: [{ scale: pulse }] },
        ]}
      >
        🔥
      </Animated.Text>
      <Text style={isHero ? styles.numberHero : styles.numberLg}>
        {displayDays}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  flameHero: { fontSize: 40, marginBottom: -spacing.xs },
  flameLg: { fontSize: 28, marginBottom: -spacing.xxs },
  numberHero: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  numberLg: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.goldSoft,
    letterSpacing: letterSpacing.widest,
    marginTop: spacing.xxs,
  },
});
