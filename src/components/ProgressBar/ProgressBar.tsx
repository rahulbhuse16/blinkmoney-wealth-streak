import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/theme";

interface ProgressBarProps {
  progress: number; // 0 - 1
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
  animate?: boolean;
  accessibilityLabel?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  trackColor = colors.bgSubtle,
  fillColor = colors.gold,
  style,
  animate = true,
  accessibilityLabel,
}: ProgressBarProps) {
  const clamped = Math.max(
    0,
    Math.min(1, Number.isFinite(progress) ? progress : 0),
  );
  const widthAnim = useRef(new Animated.Value(animate ? 0 : clamped)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(widthAnim, {
        toValue: clamped,
        duration: 900,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(clamped);
    }
  }, [clamped, animate, widthAnim]);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            borderRadius: height / 2,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
