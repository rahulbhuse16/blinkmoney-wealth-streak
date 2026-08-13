import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Named import alone is sufficient to register gesture handler; importing it
// again for side effects would trigger a duplicate-import lint error.

import { WealthProvider } from "@/features/wealthStreak/hooks/useWealthContext";
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WealthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </WealthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
