/**
 * Shared types for the contextual walkthrough. Kept free of React imports so
 * feature code can describe steps without pulling in the overlay.
 */

/** A measured target, in window coordinates. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TooltipPlacement = "auto" | "above" | "below";

export interface WalkthroughStep<Id extends string = string> {
  /** Matches the id the target was registered with. */
  id: Id;
  title: string;
  description: string;
  /** Label of the primary action. Defaults to "Next" / "Got it" on the last step. */
  ctaLabel?: string;
  placement?: TooltipPlacement;
  /** Corner radius of the spotlight cutout — match the target's own radius. */
  spotlightRadius?: number;
  /** Extra breathing room around the target, in px. */
  spotlightPadding?: number;
}

export type MeasureTarget = (id: string) => Promise<TargetRect | null>;

/** Returns true when a scroll was performed and the target must be re-measured. */
export type EnsureTargetVisible = (rect: TargetRect) => Promise<boolean>;
