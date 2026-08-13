import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

import { colors } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PARTICLE_COLORS = [
  colors.gold,
  colors.mint,
  colors.goldSoft,
  colors.mintSoft,
  colors.info,
];
const PARTICLE_COUNT = 18;

interface ParticleConfig {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotationDeg: number;
}

/**
 * Tasteful, performance-conscious celebration effect: a small burst of
 * falling particles that fades out, rather than a persistent confetti loop.
 * Uses native-driver animations only.
 */
export function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        left: Math.random() * SCREEN_WIDTH,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 250,
        duration: 1400 + Math.random() * 700,
        rotationDeg: Math.random() * 360,
      })),
    [],
  );

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <Particle key={p.id} config={p} />
      ))}
    </View>
  );
}

function Particle({ config }: { config: ParticleConfig }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(config.delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 420,
          duration: config.duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.delay(config.duration - 500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: config.left,
        top: 0,
        width: config.size,
        height: config.size * 2.2,
        borderRadius: 2,
        backgroundColor: config.color,
        opacity,
        transform: [
          { translateY },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", `${config.rotationDeg + 360}deg`],
            }),
          },
        ],
      }}
    />
  );
}
