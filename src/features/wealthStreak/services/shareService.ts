import * as Sharing from "expo-sharing";
import { Platform, Share, View } from "react-native";

export const shareService = {
  async shareAchievementImage(
    viewRef: React.RefObject<View>,
    fallbackText: string,
  ): Promise<void> {
    try {
      // Lazy import: react-native-view-shot may not be available in all environments (e.g. web).
      const { captureRef } = await import("react-native-view-shot");
      if (!viewRef.current) throw new Error("Nothing to capture");

      const uri = await captureRef(viewRef, { format: "png", quality: 1 });
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your BlinkMoney streak",
        });
        return;
      }
      // Fall through to text share if native image sharing isn't available.
      await shareService.shareText(fallbackText);
    } catch {
      // Any capture/share failure falls back to a functional text share
      // rather than leaving the user with a dead button.
      await shareService.shareText(fallbackText);
    }
  },

  async shareText(text: string): Promise<void> {
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { message: text }
          : { message: text, title: "BlinkMoney" },
      );
    } catch {
      // Swallow — sharing is best-effort and should never crash the app.
    }
  },
};
