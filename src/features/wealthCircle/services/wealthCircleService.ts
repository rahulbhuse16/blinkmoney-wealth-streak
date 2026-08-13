import {
  challengeNameFor,
  getIsCircleFull,
  makeCreatorMember,
} from "../mock/mockData";
import {
  ChallengeDuration,
  CircleMember,
  CircleProgressSummary,
  MAX_CIRCLE_FRIENDS,
  WealthCircle,
} from "../types";

/**
 * In-memory mock "backend" for the Wealth Circle feature, mirroring the
 * pattern used by wealthService (module-level mutable state + simulated
 * network latency/failure). `null` circleState represents a user who
 * hasn't created a circle yet — screens treat this as the empty state.
 */
let circleState: WealthCircle | null = null;

export const circleNetworkConfig = {
  forceNextFailure: false,
  minLatencyMs: 500,
  maxLatencyMs: 1100,
};

function randomLatency() {
  const { minLatencyMs, maxLatencyMs } = circleNetworkConfig;
  return minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs);
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), randomLatency()),
  );
}

function maybeFail(message: string): void {
  if (circleNetworkConfig.forceNextFailure) {
    circleNetworkConfig.forceNextFailure = false;
    throw new Error(message);
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextMemberId(): string {
  return `member-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function recomputeCircleDay(circle: WealthCircle): WealthCircle {
  const start = new Date(circle.startDate).getTime();
  const now = Date.now();
  const dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(circle.durationDays, dayIndex));
  const status: WealthCircle["status"] =
    currentDay >= circle.durationDays ? "completed" : "active";
  return { ...circle, currentDay, status };
}

export const wealthCircleService = {
  /** Fetch the current user's Wealth Circle, or null if none has been created. */
  async getWealthCircle(): Promise<WealthCircle | null> {
    return delay(null).then(() => {
      maybeFail("Couldn't load your Wealth Circle.");
      if (!circleState) return null;
      circleState = recomputeCircleDay(circleState);
      return { ...circleState, members: [...circleState.members] };
    });
  },

  /** Create a new Wealth Circle with the creator as the sole initial member. */
  async createWealthCircle(
    durationDays: ChallengeDuration,
  ): Promise<WealthCircle> {
    return delay(null).then(() => {
      maybeFail("Couldn't create your Wealth Circle. Please try again.");
      if (circleState && circleState.status === "active") {
        // Guards against duplicate-creation races (e.g. rapid double taps
        // slipping past the UI-level debounce).
        return { ...circleState };
      }
      const circle: WealthCircle = {
        id: `circle-${Date.now()}`,
        name: challengeNameFor(durationDays),
        durationDays,
        startDate: todayISO(),
        currentDay: 1,
        status: "active",
        members: [makeCreatorMember()],
      };
      circleState = circle;
      return { ...circle };
    });
  },

  /** Invite a friend by name. Adds them as a pending member. */
  async inviteMember(name: string): Promise<CircleMember> {
    return delay(null).then(() => {
      maybeFail("Couldn't send the invitation.");
      if (!circleState)
        throw new Error("No active Wealth Circle to invite to.");

      const trimmed = name.trim();
      if (!trimmed) throw new Error("Enter a name to invite.");

      const duplicate = circleState.members.find(
        (m) => m.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) {
        throw new Error(`You've already invited ${duplicate.name}.`);
      }

      if (getIsCircleFull(circleState)) {
        throw new Error(
          "Your Wealth Circle is full. You already have 5 friends in this challenge.",
        );
      }

      const member: CircleMember = {
        id: nextMemberId(),
        name: trimmed,
        status: "pending",
        streakDays: 0,
        invitedOn: todayISO(),
      };
      circleState = {
        ...circleState,
        members: [...circleState.members, member],
      };
      return { ...member };
    });
  },

  /** Dev/demo helper: simulate a pending invite being accepted and the friend becoming active. */
  async simulateMemberJoin(memberId: string): Promise<CircleMember> {
    return delay(null).then(() => {
      maybeFail("Couldn't sync your Wealth Circle right now.");
      if (!circleState) throw new Error("No active Wealth Circle.");

      const member = circleState.members.find((m) => m.id === memberId);
      if (!member) throw new Error("That member no longer exists.");
      if (member.status !== "pending") return { ...member };

      const joined: CircleMember = {
        ...member,
        status: "active",
        streakDays: 1,
      };
      circleState = {
        ...circleState,
        members: circleState.members.map((m) =>
          m.id === memberId ? joined : m,
        ),
      };
      return { ...joined };
    });
  },

  /** Convenience accessor for lightweight progress summaries (e.g. dashboard teaser). */
  async getCircleProgress(): Promise<CircleProgressSummary | null> {
    return delay(null).then(() => {
      maybeFail("Couldn't load your circle's progress.");
      if (!circleState) return null;
      circleState = recomputeCircleDay(circleState);
      const activeToday = circleState.members.filter(
        (m) => m.status === "active",
      ).length;
      return {
        currentDay: circleState.currentDay,
        durationDays: circleState.durationDays,
        activeToday,
        totalMembers: circleState.members.length,
        overallProgress: Math.min(
          1,
          circleState.currentDay / circleState.durationDays,
        ),
      };
    });
  },

  /** Dev/testing helper: reset the mock backend to a named scenario. */
  async resetToScenario(
    scenario: "none" | "empty" | "partial" | "nearly_complete" | "completed",
  ): Promise<WealthCircle | null> {
    switch (scenario) {
      case "none":
        circleState = null;
        break;
      case "empty":
        circleState = {
          id: "circle-demo-empty",
          name: challengeNameFor(30),
          durationDays: 30,
          startDate: todayISO(),
          currentDay: 1,
          status: "active",
          members: [makeCreatorMember()],
        };
        break;
      case "partial":
        circleState = {
          id: "circle-demo-partial",
          name: challengeNameFor(30),
          durationDays: 30,
          startDate: new Date(
            Date.now() - 17 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          currentDay: 18,
          status: "active",
          members: [
            { ...makeCreatorMember(), streakDays: 18 },
            {
              id: "member-rahul",
              name: "Rahul",
              status: "active",
              streakDays: 18,
              invitedOn: todayISO(),
            },
            {
              id: "member-amit",
              name: "Amit",
              status: "inactive",
              streakDays: 15,
              invitedOn: todayISO(),
            },
            {
              id: "member-priya",
              name: "Priya",
              status: "joined",
              streakDays: 12,
              invitedOn: todayISO(),
            },
            {
              id: "member-sneha",
              name: "Sneha",
              status: "pending",
              streakDays: 0,
              invitedOn: todayISO(),
            },
          ],
        };
        break;
      case "nearly_complete":
        circleState = {
          id: "circle-demo-nearly",
          name: challengeNameFor(30),
          durationDays: 30,
          startDate: new Date(
            Date.now() - 28 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          currentDay: 29,
          status: "active",
          members: [
            { ...makeCreatorMember(), streakDays: 29 },
            {
              id: "member-rahul",
              name: "Rahul",
              status: "active",
              streakDays: 29,
              invitedOn: todayISO(),
            },
            {
              id: "member-amit",
              name: "Amit",
              status: "active",
              streakDays: 27,
              invitedOn: todayISO(),
            },
          ],
        };
        break;
      case "completed":
        circleState = {
          id: "circle-demo-complete",
          name: challengeNameFor(30),
          durationDays: 30,
          startDate: new Date(
            Date.now() - 31 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          currentDay: 30,
          status: "completed",
          members: [
            { ...makeCreatorMember(), streakDays: 30 },
            {
              id: "member-rahul",
              name: "Rahul",
              status: "active",
              streakDays: 30,
              invitedOn: todayISO(),
            },
            {
              id: "member-amit",
              name: "Amit",
              status: "active",
              streakDays: 30,
              invitedOn: todayISO(),
            },
            {
              id: "member-priya",
              name: "Priya",
              status: "active",
              streakDays: 30,
              invitedOn: todayISO(),
            },
          ],
        };
        break;
    }
    return delay(circleState ? { ...circleState } : null);
  },
};

export const MAX_CIRCLE_FRIENDS_LIMIT = MAX_CIRCLE_FRIENDS;