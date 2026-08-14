import React from "react";
import { Animated, StyleSheet } from "react-native";

import { colors, radius as radiusTokens } from "@/theme";

export interface SpotlightGeometry {
  x: Animated.Value;
  y: Animated.Value;
  width: Animated.Value;
  height: Animated.Value;
}

interface WalkthroughSpotlightProps {
  geometry: SpotlightGeometry;
  /** Opacity of the dimmed area (animated on enter/exit). */
  opacity: Animated.Value;
  cornerRadius?: number;
}

/**
 * Dims the screen with four animated panels arranged around the target so the
 * highlighted element itself stays fully legible — a cutout, without needing
 * SVG masks or an extra dependency.
 *
 * Touches are captured by the parent overlay, so the "hole" never leaks taps
 * through to the underlying UI.
 */
export function WalkthroughSpotlight({
  geometry,
  opacity,
  cornerRadius = radiusTokens.lg,
}: WalkthroughSpotlightProps) {
  const { x, y, width, height } = geometry;
  const right = Animated.add(x, width);
  const bottom = Animated.add(y, height);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[styles.dim, { top: 0, left: 0, right: 0, height: y }]}
      />
      <Animated.View
        style={[styles.dim, { top: bottom, left: 0, right: 0, bottom: 0 }]}
      />
      <Animated.View
        style={[styles.dim, { top: y, left: 0, width: x, height }]}
      />
      <Animated.View
        style={[styles.dim, { top: y, left: right, right: 0, height }]}
      />

      <Animated.View
        style={[
          styles.ring,
          {
            top: y,
            left: x,
            width,
            height,
            borderRadius: cornerRadius,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: colors.overlay,
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.transparent,
  },
});
