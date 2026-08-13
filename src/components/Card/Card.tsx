import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "@/theme";

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  variant?: "default" | "outline" | "subtle";
  style?: ViewStyle | ViewStyle[];
}

export function Card({
  padded = true,
  elevated = true,
  variant = "default",
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        padded && styles.padded,
        elevated && shadows.sm,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
  },
  padded: { padding: spacing.lg },
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: colors.bgElevated },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtle: { backgroundColor: colors.bgSubtle },
});
