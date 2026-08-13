import { Achievement, Milestone, WealthProfile } from "../types";

export const MILESTONE_DEFINITIONS: Omit<Milestone, "status">[] = [
  {
    id: "milestone-first",
    title: "First Investment",
    description: "Make your very first investment",
    icon: "🌱",
    targetDays: 1,
  },
  {
    id: "milestone-7",
    title: "7 Day Streak",
    description: "Invest consistently for 7 days",
    icon: "🔥",
    targetDays: 7,
  },
  {
    id: "milestone-30",
    title: "30 Day Streak",
    description: "Invest consistently for 30 days",
    icon: "⚡",
    targetDays: 30,
  },
  {
    id: "milestone-50",
    title: "50 Day Streak",
    description: "Invest consistently for 50 days",
    icon: "💎",
    targetDays: 50,
  },
  {
    id: "milestone-100",
    title: "100 Day Streak",
    description: "Invest consistently for 100 days",
    icon: "🏆",
    targetDays: 100,
  },
];

export function buildMilestones(currentStreakDays: number): Milestone[] {
  return MILESTONE_DEFINITIONS.map((def) => {
    let status: Milestone["status"] = "locked";
    if (currentStreakDays >= def.targetDays) {
      status = "completed";
    } else {
      // The lowest not-yet-completed milestone is "current"
      status = "locked";
    }
    return { ...def, status };
  }).map((m, idx, arr) => {
    if (m.status === "completed") return m;
    const firstIncomplete = arr.findIndex((x) => x.status !== "completed");
    if (idx === firstIncomplete) return { ...m, status: "current" as const };
    return m;
  });
}

export const DEFAULT_WEALTH_PROFILE: WealthProfile = {
  userName: "Rahul Bhuse",
  isFirstTimeUser: false,
  currentStreakDays: 47,
  longestStreakDays: 47,
  totalInvested: 4700,
  estimatedGrowth: 312,
  currentXP: 2450,
  level: 8,
  xpForCurrentLevel: 2400,
  xpForNextLevel: 2700,
  nextMilestone: {
    id: "milestone-50",
    title: "50 Day Streak",
    description: "Invest consistently for 50 days",
    icon: "💎",
    targetDays: 50,
    status: "current",
  },
  hasInvestedToday: false,
  streakBroken: false,
  streakBrokenAtDays: null,
  lastInvestmentDate: null,
};

export const FIRST_TIME_WEALTH_PROFILE: WealthProfile = {
  userName: "Priya",
  isFirstTimeUser: true,
  currentStreakDays: 0,
  longestStreakDays: 0,
  totalInvested: 0,
  estimatedGrowth: 0,
  currentXP: 0,
  level: 1,
  xpForCurrentLevel: 0,
  xpForNextLevel: 300,
  nextMilestone: {
    id: "milestone-first",
    title: "First Investment",
    description: "Make your very first investment",
    icon: "🌱",
    targetDays: 1,
    status: "current",
  },
  hasInvestedToday: false,
  streakBroken: false,
  streakBrokenAtDays: null,
  lastInvestmentDate: null,
};

export const MISSED_STREAK_WEALTH_PROFILE: WealthProfile = {
  ...DEFAULT_WEALTH_PROFILE,
  userName: "Rohan",
  currentStreakDays: 0,
  streakBroken: true,
  streakBrokenAtDays: 47,
  hasInvestedToday: false,
};

export function buildAchievements(profile: WealthProfile): Achievement[] {
  const { currentStreakDays, longestStreakDays, isFirstTimeUser } = profile;
  const effectiveStreak = Math.max(currentStreakDays, longestStreakDays);

  if (isFirstTimeUser) {
    return [
      {
        id: "ach-first-step",
        title: "First Step",
        description: "Make your first investment",
        icon: "🌱",
        state: "locked",
        progressCurrent: 0,
        progressTarget: 1,
      },
      {
        id: "ach-consistency",
        title: "Consistency",
        description: "Reach a 30-day streak",
        icon: "🔥",
        state: "locked",
        progressCurrent: 0,
        progressTarget: 30,
      },
      {
        id: "ach-momentum",
        title: "Momentum",
        description: "Complete 50 investments",
        icon: "⚡",
        state: "locked",
        progressCurrent: 0,
        progressTarget: 50,
      },
      {
        id: "ach-legend",
        title: "Legend",
        description: "Reach a 100-day streak",
        icon: "🏆",
        state: "locked",
        progressCurrent: 0,
        progressTarget: 100,
      },
    ];
  }

  return [
    {
      id: "ach-first-step",
      title: "First Step",
      description: "First investment made",
      icon: "🌱",
      state: "unlocked",
      unlockedOn: "2026-06-01",
    },
    {
      id: "ach-consistency",
      title: "Consistency",
      description: "30-day streak reached",
      icon: "🔥",
      state: effectiveStreak >= 30 ? "unlocked" : "in_progress",
      progressCurrent: Math.min(effectiveStreak, 30),
      progressTarget: 30,
      unlockedOn: effectiveStreak >= 30 ? "2026-07-01" : undefined,
    },
    {
      id: "ach-wealth-builder",
      title: "Wealth Builder",
      description: "Reach a 50-day streak",
      icon: "💎",
      state: effectiveStreak >= 50 ? "unlocked" : "in_progress",
      progressCurrent: Math.min(effectiveStreak, 50),
      progressTarget: 50,
    },
    {
      id: "ach-momentum",
      title: "Momentum",
      description: "Complete 50 investments",
      icon: "⚡",
      state: "locked",
      progressCurrent: Math.min(effectiveStreak, 50),
      progressTarget: 50,
    },
    {
      id: "ach-legend",
      title: "Legend",
      description: "Reach a 100-day streak",
      icon: "🏆",
      state: "locked",
      progressCurrent: Math.min(effectiveStreak, 100),
      progressTarget: 100,
    },
  ];
}
