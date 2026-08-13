import {
  NavigationContainer,
  DarkTheme,
  Theme as NavTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { RootStackParamList } from "./types";

import CreateWealthCircleScreen from "@/features/wealthCircle/screens/CreateWealthCircleScreen";
import InviteFriendsScreen from "@/features/wealthCircle/screens/InviteFriendsScreen";
import WealthCircleCreatedScreen from "@/features/wealthCircle/screens/WealthCircleCreatedScreen";
import WealthCircleScreen from "@/features/wealthCircle/screens/WealthCircleScreen";
import AchievementsScreen from "@/features/wealthStreak/screens/AchievementsScreen";
import ConfirmationScreen from "@/features/wealthStreak/screens/ConfirmationScreen";
import InvestScreen from "@/features/wealthStreak/screens/InvestScreen";
import InvestmentSuccessScreen from "@/features/wealthStreak/screens/InvestmentSuccessScreen";
import WealthHomeScreen from "@/features/wealthStreak/screens/WealthHomeScreen";
import WealthJourneyScreen from "@/features/wealthStreak/screens/WealthJourneyScreen";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.gold,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="WealthHome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="WealthHome" component={WealthHomeScreen} />
        <Stack.Screen name="Invest" component={InvestScreen} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        <Stack.Screen
          name="InvestmentSuccess"
          component={InvestmentSuccessScreen}
          options={{ gestureEnabled: false, animation: "fade" }}
        />
        <Stack.Screen name="WealthJourney" component={WealthJourneyScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />

        {/* Wealth Circle — referral/social challenge flow */}
        <Stack.Screen
          name="CreateWealthCircle"
          component={CreateWealthCircleScreen}
        />
        <Stack.Screen
          name="WealthCircleCreated"
          component={WealthCircleCreatedScreen}
          options={{ gestureEnabled: false, animation: "fade" }}
        />
        <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
        <Stack.Screen name="WealthCircle" component={WealthCircleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}