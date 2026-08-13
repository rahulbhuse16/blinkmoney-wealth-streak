
export const colors = {
  // Base
  bg: "#0B1F17", // deep forest — primary background
  bgElevated: "#122A20", // card surface
  bgElevatedAlt: "#163326", // secondary card surface / pressed state
  bgSubtle: "#0E241B",

  border: "#1E3E30",
  borderStrong: "#2A5240",

  // Text
  textPrimary: "#F4F7F3",
  textSecondary: "#AFC4B8",
  textTertiary: "#7C9484",
  textInverse: "#0B1F17",

  // Brand / accent
  gold: "#E7B85C", // wealth, streaks, XP
  goldSoft: "#F3D9A0",
  goldDeep: "#B98A2E",

  mint: "#5CE7B0", // growth, success, positive deltas
  mintSoft: "#B8F5DD",
  mintDeep: "#2E9E71",

  // Semantic
  success: "#5CE7B0",
  error: "#F0745B",
  errorSoft: "#3A241F",
  warning: "#E7B85C",
  info: "#6FB7E7",

  // Overlays
  overlay: "rgba(6, 16, 12, 0.72)",
  scrim: "rgba(6, 16, 12, 0.4)",

  // Locked / disabled
  locked: "#2A3B33",
  lockedText: "#5C7267",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorToken = keyof typeof colors;
