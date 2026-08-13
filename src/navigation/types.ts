import { InvestmentResult } from "@/features/wealthStreak/types";

export type RootStackParamList = {
  WealthHome: undefined;
  Invest: undefined;
  Confirmation: { amount: number };
  InvestmentSuccess: { result: InvestmentResult };
  WealthJourney: undefined;
  Achievements: undefined;
  
  CreateWealthCircle: undefined;
  WealthCircleCreated: { circleId: string };
  InviteFriends: undefined;
  WealthCircle: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}