import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/theme";

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius: br = radius.sm,
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: br,
          backgroundColor: colors.bgElevatedAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Skeleton mimicking the dashboard layout, shown while the profile loads. */
export function DashboardSkeleton() {
  return (
    <View
      style={styles.container}
      accessibilityLabel="Loading your wealth journey"
      accessible
    >
      <SkeletonBlock width="60%" height={18} />
      <SkeletonBlock
        width="40%"
        height={28}
        style={{ marginTop: spacing.sm }}
      />
      <View style={styles.heroBlock}>
        <SkeletonBlock width={120} height={120} borderRadius={60} />
      </View>
      <View style={styles.statsRow}>
        <SkeletonBlock width="31%" height={90} borderRadius={radius.lg} />
        <SkeletonBlock width="31%" height={90} borderRadius={radius.lg} />
        <SkeletonBlock width="31%" height={90} borderRadius={radius.lg} />
      </View>
      <SkeletonBlock
        width="100%"
        height={64}
        borderRadius={radius.md}
        style={{ marginTop: spacing.lg }}
      />
      <SkeletonBlock
        width="50%"
        height={18}
        style={{ marginTop: spacing.xl }}
      />
      <View style={styles.cardsRow}>
        <SkeletonBlock width={160} height={140} borderRadius={radius.lg} />
        <SkeletonBlock width={160} height={140} borderRadius={radius.lg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  heroBlock: { alignItems: "center", marginVertical: spacing.xl },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
});
