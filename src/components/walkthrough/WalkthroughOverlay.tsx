import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WalkthroughSpotlight } from "./WalkthroughSpotlight";
import { WalkthroughTooltip } from "./WalkthroughTooltip";
import {
  EnsureTargetVisible,
  MeasureTarget,
  TargetRect,
  WalkthroughStep,
} from "./walkthroughTypes";

import { radius as radiusTokens, spacing } from "@/theme";

const SPOTLIGHT_DURATION = 260;
const TOOLTIP_IN_DURATION = 220;
const TOOLTIP_OUT_DURATION = 140;
const MEASURE_RETRIES = 5;
const MEASURE_RETRY_DELAY = 120;
const SCROLL_SETTLE_DELAY = 340;
/** Used only to choose above/below placement before the tooltip has laid out. */
const ESTIMATED_TOOLTIP_HEIGHT = 210;

interface WalkthroughOverlayProps {
  steps: WalkthroughStep[];
  visible: boolean;
  currentStep: number;
  measureTarget: MeasureTarget;
  /** Optional hook to scroll an off-screen target into view before measuring. */
  ensureTargetVisible?: EnsureTargetVisible;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface ResolvedTarget {
  rect: TargetRect;
  cornerRadius: number;
}

/**
 * Contextual spotlight walkthrough. Targets are measured at runtime — nothing
 * is hardcoded — and the whole thing lives in a transparent modal so the real
 * dashboard stays visible underneath while taps are safely absorbed.
 */
export function WalkthroughOverlay({
  steps,
  visible,
  currentStep,
  measureTarget,
  ensureTargetVisible,
  onNext,
  onBack,
  onSkip,
}: WalkthroughOverlayProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [target, setTarget] = useState<ResolvedTarget | null>(null);

  const geometry = useRef({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    width: new Animated.Value(0),
    height: new Animated.Value(0),
  }).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTranslate = useRef(new Animated.Value(10)).current;
  const hasSpotlightRef = useRef(false);

  const step = steps[currentStep];

  useEffect(() => {
    if (!visible) {
      hasSpotlightRef.current = false;
      overlayOpacity.setValue(0);
      tooltipOpacity.setValue(0);
      setTarget(null);
      return;
    }
    if (!step) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const animations: Animated.CompositeAnimation[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const animate = (animation: Animated.CompositeAnimation) =>
      new Promise<void>((resolve) => {
        animations.push(animation);
        animation.start(() => resolve());
      });

    const measureWithRetry = async (id: string) => {
      for (let attempt = 0; attempt < MEASURE_RETRIES; attempt += 1) {
        const measured = await measureTarget(id);
        if (cancelled) return null;
        if (measured) return measured;
        await wait(MEASURE_RETRY_DELAY);
        if (cancelled) return null;
      }
      return null;
    };

    const run = async () => {
      if (hasSpotlightRef.current) {
        await animate(
          Animated.timing(tooltipOpacity, {
            toValue: 0,
            duration: TOOLTIP_OUT_DURATION,
            useNativeDriver: true,
          }),
        );
        if (cancelled) return;
      }

      let rect = await measureWithRetry(step.id);
      if (cancelled) return;

      if (rect && ensureTargetVisible) {
        const didScroll = await ensureTargetVisible(rect);
        if (cancelled) return;
        if (didScroll) {
          await wait(SCROLL_SETTLE_DELAY);
          if (cancelled) return;
          rect = (await measureWithRetry(step.id)) ?? rect;
          if (cancelled) return;
        }
      }

      if (!rect) {
        // Target never mounted or measured invalid — move on instead of
        // stranding the user on an empty spotlight.
        onNext();
        return;
      }

      const pad = step.spotlightPadding ?? spacing.xs;
      const padded: TargetRect = {
        x: Math.max(0, rect.x - pad),
        y: Math.max(0, rect.y - pad),
        width: Math.min(windowWidth, rect.width + pad * 2),
        height: Math.min(windowHeight, rect.height + pad * 2),
      };

      setTarget({
        rect: padded,
        cornerRadius: step.spotlightRadius ?? radiusTokens.lg,
      });

      const isFirstSpotlight = !hasSpotlightRef.current;
      hasSpotlightRef.current = true;

      if (isFirstSpotlight) {
        geometry.x.setValue(padded.x);
        geometry.y.setValue(padded.y);
        geometry.width.setValue(padded.width);
        geometry.height.setValue(padded.height);
        animations.push(
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: SPOTLIGHT_DURATION,
            useNativeDriver: true,
          }),
        );
        animations[animations.length - 1].start();
        await wait(60);
      } else {
        await animate(
          Animated.parallel([
            Animated.timing(geometry.x, {
              toValue: padded.x,
              duration: SPOTLIGHT_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(geometry.y, {
              toValue: padded.y,
              duration: SPOTLIGHT_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(geometry.width, {
              toValue: padded.width,
              duration: SPOTLIGHT_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(geometry.height, {
              toValue: padded.height,
              duration: SPOTLIGHT_DURATION,
              useNativeDriver: false,
            }),
          ]),
        );
      }
      if (cancelled) return;

      tooltipTranslate.setValue(10);
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: TOOLTIP_IN_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslate, {
          toValue: 0,
          duration: TOOLTIP_IN_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.stop());
    };
  }, [
    visible,
    step,
    measureTarget,
    ensureTargetVisible,
    onNext,
    windowWidth,
    windowHeight,
    geometry,
    overlayOpacity,
    tooltipOpacity,
    tooltipTranslate,
  ]);

  const tooltipStyle = useMemo<ViewStyle | null>(() => {
    if (!target) return null;
    const gap = spacing.sm;
    const margin = spacing.lg;
    const { rect } = target;

    const spaceBelow =
      windowHeight - insets.bottom - (rect.y + rect.height) - gap;
    const spaceAbove = rect.y - insets.top - gap;
    const placement =
      step?.placement && step.placement !== "auto"
        ? step.placement
        : spaceBelow >= ESTIMATED_TOOLTIP_HEIGHT || spaceBelow >= spaceAbove
          ? "below"
          : "above";

    const base: ViewStyle = {
      left: margin,
      width: windowWidth - margin * 2,
    };

    return placement === "below"
      ? {
          ...base,
          top: rect.y + rect.height + gap,
          maxHeight: Math.max(140, spaceBelow),
        }
      : {
          ...base,
          bottom: windowHeight - rect.y + gap,
          maxHeight: Math.max(140, spaceAbove),
        };
  }, [target, step, windowWidth, windowHeight, insets.top, insets.bottom]);

  const handleOverlayPress = useCallback(() => {
    // Absorb stray taps: progression is explicit, via the tooltip controls.
  }, []);

  if (!visible || !step) return null;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleOverlayPress}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      {target ? (
        <>
          <WalkthroughSpotlight
            geometry={geometry}
            opacity={overlayOpacity}
            cornerRadius={target.cornerRadius}
          />
          <WalkthroughTooltip
            title={step.title}
            description={step.description}
            stepIndex={currentStep}
            stepCount={steps.length}
            ctaLabel={step.ctaLabel ?? (isLastStep ? "Got it" : "Next")}
            canGoBack={currentStep > 0}
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
            style={[
              tooltipStyle,
              {
                opacity: tooltipOpacity,
                transform: [{ translateY: tooltipTranslate }],
              },
            ]}
          />
        </>
      ) : null}
    </Modal>
  );
}
