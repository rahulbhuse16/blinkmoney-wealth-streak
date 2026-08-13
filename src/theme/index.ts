import { colors } from "./colors";
import { shadows } from "./shadows";
import { spacing, radius, iconSize } from "./spacing";
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} from "./typography";

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  radius,
  iconSize,
  shadows,
};

export type Theme = typeof theme;

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";
