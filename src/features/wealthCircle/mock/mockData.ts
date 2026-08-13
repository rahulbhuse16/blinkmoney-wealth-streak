import {
  ChallengeDuration,
  CircleMember,
  MAX_CIRCLE_FRIENDS,
  WealthCircle,
} from "../types";

export function challengeNameFor(durationDays: ChallengeDuration): string {
  return `${durationDays}-Day Wealth Challenge`;
}

export function makeCreatorMember(): CircleMember {
  return {
    id: "member-you",
    name: "You",
    status: "active",
    streakDays: 1,
    isYou: true,
    invitedOn: new Date().toISOString().slice(0, 10),
  };
}

export function getIsCircleFull(circle: WealthCircle): boolean {
  const friendCount = circle.members.filter((m) => !m.isYou).length;
  return friendCount >= MAX_CIRCLE_FRIENDS;
}

export function getRemainingFriendSlots(circle: WealthCircle): number {
  const friendCount = circle.members.filter((m) => !m.isYou).length;
  return Math.max(0, MAX_CIRCLE_FRIENDS - friendCount);
}