export type MilestoneStatus = "completed" | "current" | "locked";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji identity, sparingly used per design guidance
  targetDays: number;
  status: MilestoneStatus;
}

export type AchievementState = "unlocked" | "in_progress" | "locked";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  state: AchievementState;
  progressCurrent?: number;
  progressTarget?: number;
  unlockedOn?: string; // ISO date
}

export interface WealthProfile {
  userName: string;
  isFirstTimeUser: boolean;
  currentStreakDays: number;
  longestStreakDays: number;
  totalInvested: number; // in INR
  estimatedGrowth: number; // in INR
  currentXP: number;
  level: number;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
  nextMilestone: Milestone | null;
  hasInvestedToday: boolean;
  streakBroken: boolean;
  streakBrokenAtDays: number | null;
  lastInvestmentDate: string | null; // ISO date
}

export interface JourneyData {
  level: number;
  levelTitle: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  milestones: Milestone[];
}

export interface InvestmentResult {
  amount: number;
  newStreakDays: number;
  xpEarned: number;
  newTotalXP: number;
  newTotalInvested: number;
  newEstimatedGrowth: number;
  milestoneUnlocked: Milestone | null;
  daysUntilNextMilestone: number | null;
  nextMilestone: Milestone | null;
}

export type InvestmentAmountPreset = 21 | 51 | 101 | 501;

export interface ServiceFailureConfig {
  forceFail?: boolean;
  failureRate?: number; // 0-1, probability of simulated random failure
}
