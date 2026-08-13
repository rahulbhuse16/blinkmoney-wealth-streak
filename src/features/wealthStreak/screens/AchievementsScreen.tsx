import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { wealthService } from "../services/wealthService";
import { Achievement } from "../types";

import { AchievementCard } from "@/components/AchievementCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { SkeletonBlock } from "@/components/LoadingSkeleton";
import { RootStackParamList } from "@/navigation/types";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "Achievements">;

interface Section {
  title: string;
  data: Achievement[];
}

export default function AchievementsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wealthService.getAchievements();
      setAchievements(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load your achievements.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const sections: Section[] = achievements
    ? [
        {
          title: "Unlocked",
          data: achievements.filter((a) => a.state === "unlocked"),
        },
        {
          title: "In Progress",
          data: achievements.filter((a) => a.state === "in_progress"),
        },
        {
          title: "Locked",
          data: achievements.filter((a) => a.state === "locked"),
        },
      ].filter((s) => s.data.length > 0)
    : [];

  return (
    <View style={styles.screen}>
      <Header title="Achievements" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View
          style={{
            padding: spacing.lg,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.md,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              width={168}
              height={148}
              borderRadius={radius.lg}
            />
          ))}
        </View>
      ) : error || !achievements ? (
        <View style={styles.center}>
          <ErrorState title="Couldn't load your achievements." onRetry={load} />
        </View>
      ) : achievements.length === 0 ? (
        <EmptyState
          emoji="🏅"
          title="No achievements yet"
          description="Start investing to unlock your first badge."
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.title}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl,
          }}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <View style={styles.grid}>
                {item.data.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
});
