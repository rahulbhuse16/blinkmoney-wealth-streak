export type ChallengeDuration = 7 | 30 | 50;

export const CHALLENGE_DURATIONS: ChallengeDuration[] = [7, 30, 50];

export const MAX_CIRCLE_FRIENDS = 5;

/**
 * Lifecycle status of the circle itself. Deliberately excludes a "full"
 * variant (unlike the raw spec) because capacity is a derived condition —
 * a circle can be simultaneously active AND full. Screens read `isFull`
 * (see `getIsCircleFull`) instead of branching on status for that case.
 */
export type CircleStatus = "active" | "completed";

/**
 * Mirrors the member lifecycle used across invite/join flows:
 * - pending: invited, has not joined yet
 * - joined: accepted the invite, hasn't logged activity yet today
 * - active: accepted AND has shown up today (has a live streak day)
 * - inactive: joined previously but hasn't shown up today
 */
export type MemberStatus = "pending" | "joined" | "active" | "inactive";

export interface CircleMember {
  id: string;
  name: string;
  status: MemberStatus;
  streakDays: number; // meaningful once status is joined/active/inactive; 0 while pending
  isYou?: boolean;
  invitedOn: string; // ISO date
}

export interface WealthCircle {
  id: string;
  name: string; // e.g. "30-Day Wealth Challenge"
  durationDays: ChallengeDuration;
  startDate: string; // ISO date
  currentDay: number; // 1-indexed day within the challenge, clamped to durationDays
  status: CircleStatus;
  members: CircleMember[]; // includes the creator ("You")
}

export interface CircleProgressSummary {
  currentDay: number;
  durationDays: number;
  activeToday: number;
  totalMembers: number;
  overallProgress: number; // 0-1, currentDay / durationDays
}