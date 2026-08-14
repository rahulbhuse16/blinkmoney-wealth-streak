import { WalkthroughStep } from "@/components/walkthrough";
import { radius } from "@/theme";

export type WealthWalkthroughStepId = "streak" | "xp" | "milestones" | "invest";

/**
 * The four contextual steps shown over the real dashboard. Module-level so the
 * array identity stays stable across renders.
 */
export const WEALTH_WALKTHROUGH_STEPS: WalkthroughStep<WealthWalkthroughStepId>[] =
  [
    {
      id: "streak",
      title: "Your Wealth Streak 🔥",
      description:
        "Keep investing consistently to grow your streak and build your wealth habit.",
      ctaLabel: "Next",
      spotlightRadius: radius.lg,
    },
    {
      id: "xp",
      title: "Earn Wealth XP ✨",
      description:
        "Every completed investment helps you progress toward your next level.",
      ctaLabel: "Next",
      spotlightRadius: radius.lg,
    },
    {
      id: "milestones",
      title: "Unlock Milestones 💎",
      description:
        "Reach streak milestones and collect achievements as your wealth journey grows.",
      ctaLabel: "Next",
      spotlightRadius: radius.lg,
    },
    {
      id: "invest",
      title: "Keep Your Streak Alive 🚀",
      description:
        "Complete today's investment to continue your wealth journey.",
      ctaLabel: "Got it",
      spotlightRadius: radius.md,
    },
  ];
