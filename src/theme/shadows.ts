import { Platform, ViewStyle } from "react-native";

import { colors } from "./colors";

type ShadowStyle = Pick<
  ViewStyle,
  | "shadowColor"
  | "shadowOffset"
  | "shadowOpacity"
  | "shadowRadius"
  | "elevation"
>;

function shadow(
  elevation: number,
  opacity: number,
  radius: number,
): ShadowStyle {
  return Platform.select<ShadowStyle>({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: Math.round(elevation / 2) },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ShadowStyle;
}

export const shadows = {
  none: shadow(0, 0, 0),
  sm: shadow(2, 0.18, 4),
  md: shadow(6, 0.24, 10),
  lg: shadow(12, 0.32, 20),
  glow: {
    ...shadow(8, 0.35, 16),
    shadowColor: colors.gold,
  } as ShadowStyle,
};
