import {
  DEFAULT_WEALTH_PROFILE,
  buildAchievements,
  buildMilestones,
} from "../mock/seedData";
import {
  Achievement,
  InvestmentResult,
  JourneyData,
  Milestone,
  WealthProfile,
} from "../types";

let profileState: WealthProfile = { ...DEFAULT_WEALTH_PROFILE };

export const networkConfig = {
  forceNextFailure: false,
  minLatencyMs: 600,
  maxLatencyMs: 1200,
};

function randomLatency() {
  const { minLatencyMs, maxLatencyMs } = networkConfig;
  return minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs);
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), randomLatency()),
  );
}

function maybeFail(errorMessage: string): void {
  if (networkConfig.forceNextFailure) {
    networkConfig.forceNextFailure = false;
    throw new Error(errorMessage);
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function xpForLevel(level: number): number {
  // Simple increasing XP curve: level N requires N * 300 cumulative XP
  return level * 300;
}

function levelFromXP(xp: number): {
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level += 1;
  }
  return {
    level,
    xpForCurrentLevel: xpForLevel(level),
    xpForNextLevel: xpForLevel(level + 1),
  };
}

function levelTitleFor(level: number): string {
  if (level >= 15) return "Wealth Legend";
  if (level >= 10) return "Wealth Architect";
  if (level >= 6) return "Wealth Builder";
  if (level >= 3) return "Habit Former";
  return "Getting Started";
}

function computeNextMilestone(streakDays: number): Milestone | null {
  const milestones = buildMilestones(streakDays);
  return milestones.find((m) => m.status === "current") ?? null;
}

export const wealthService = {
  /** Fetch the user's current wealth profile summary for the dashboard. */
  async getWealthProfile(): Promise<WealthProfile> {
    return delay(null).then(() => {
      maybeFail("Unable to load your wealth profile.");
      return { ...profileState };
    });
  },

  /** Fetch achievements derived from the current profile state. */
  async getAchievements(): Promise<Achievement[]> {
    return delay(null).then(() => {
      maybeFail("Unable to load your achievements.");
      return buildAchievements(profileState);
    });
  },

  /** Fetch the full wealth journey (level + milestones). */
  async getJourney(): Promise<JourneyData> {
    return delay(null).then(() => {
      maybeFail("Unable to load your wealth journey.");
      const { level, xpForCurrentLevel, xpForNextLevel } = levelFromXP(
        profileState.currentXP,
      );
      return {
        level,
        levelTitle: levelTitleFor(level),
        currentXP: profileState.currentXP,
        xpForCurrentLevel,
        xpForNextLevel,
        milestones: buildMilestones(
          Math.max(
            profileState.currentStreakDays,
            profileState.longestStreakDays,
          ),
        ),
      };
    });
  },

  /** Whether the user has already invested today (used for the duplicate-investment edge case). */
  async getInvestmentStatus(): Promise<{ hasInvestedToday: boolean }> {
    return delay(null).then(() => ({
      hasInvestedToday: profileState.hasInvestedToday,
    }));
  },

  /** Submit today's investment. Mutates the mock backend state and returns the delta. */
  async invest(amount: number): Promise<InvestmentResult> {
    return delay(null).then(() => {
      maybeFail("Something went wrong. Your investment wasn't completed.");

      if (amount <= 0 || Number.isNaN(amount)) {
        throw new Error("Invalid investment amount.");
      }
      if (amount < 21) {
        throw new Error("Minimum investment amount is ₹21.");
      }
      if (profileState.hasInvestedToday) {
        throw new Error("You have already invested today.");
      }

      const wasBroken = profileState.streakBroken;
      const newStreakDays = wasBroken ? 1 : profileState.currentStreakDays + 1;
      const xpEarned = 100 + Math.floor(amount / 21) * 10;
      const newTotalXP = profileState.currentXP + xpEarned;
      const newTotalInvested = profileState.totalInvested + amount;
      // Simple illustrative growth model: ~6.6% notional unrealised growth
      const newEstimatedGrowth =
        Math.round((profileState.estimatedGrowth + amount * 0.066) * 100) / 100;

      const prevMilestones = buildMilestones(profileState.currentStreakDays);
      const newMilestones = buildMilestones(newStreakDays);
      const milestoneUnlocked =
        newMilestones.find(
          (m, idx) =>
            m.status === "completed" &&
            prevMilestones[idx]?.status !== "completed",
        ) ?? null;

      const nextMilestone = computeNextMilestone(newStreakDays);
      const daysUntilNextMilestone = nextMilestone
        ? nextMilestone.targetDays - newStreakDays
        : null;

      profileState = {
        ...profileState,
        currentStreakDays: newStreakDays,
        longestStreakDays: Math.max(
          profileState.longestStreakDays,
          newStreakDays,
        ),
        totalInvested: newTotalInvested,
        estimatedGrowth: newEstimatedGrowth,
        currentXP: newTotalXP,
        hasInvestedToday: true,
        streakBroken: false,
        streakBrokenAtDays: null,
        lastInvestmentDate: todayISO(),
        nextMilestone,
        isFirstTimeUser: false,
      };

      const { level } = levelFromXP(newTotalXP);
      profileState.level = level;

      return {
        amount,
        newStreakDays,
        xpEarned,
        newTotalXP,
        newTotalInvested,
        newEstimatedGrowth,
        milestoneUnlocked,
        daysUntilNextMilestone,
        nextMilestone,
      };
    });
  },

  /** Dev/testing helper: reset the mock backend to a named scenario. */
  async resetToScenario(
    scenario: "default" | "first_time" | "missed_streak" | "invested_today",
  ): Promise<WealthProfile> {
    const { FIRST_TIME_WEALTH_PROFILE, MISSED_STREAK_WEALTH_PROFILE } =
      await import("../mock/seedData");
    switch (scenario) {
      case "first_time":
        profileState = { ...FIRST_TIME_WEALTH_PROFILE };
        break;
      case "missed_streak":
        profileState = { ...MISSED_STREAK_WEALTH_PROFILE };
        break;
      case "invested_today":
        profileState = {
          ...DEFAULT_WEALTH_PROFILE,
          hasInvestedToday: true,
          lastInvestmentDate: todayISO(),
        };
        break;
      default:
        profileState = { ...DEFAULT_WEALTH_PROFILE };
    }
    return delay({ ...profileState });
  },
};
