import { Platform } from "react-native";


export const fontFamily = {
  display: Platform.select({
    ios: "System",
    android: "sans-serif-condensed",
    default: "System",
  }),
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 48,
  hero: 64,
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "800" as const,
};

export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.6,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.2,
  widest: 2,
};
