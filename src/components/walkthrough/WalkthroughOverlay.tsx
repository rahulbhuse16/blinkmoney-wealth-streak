import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
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
/**
 * Targets are polled until two consecutive measurements agree: layout, the
 * dashboard fade-in and momentum scrolling settle at device-dependent speeds,
 * and any fixed delay is either too short (stale spotlight) or wasteful.
 */
const MEASURE_ATTEMPTS = 14;
const MEASURE_INTERVAL = 80;
const MEASURE_EPSILON = 1;
const SCROLL_START_DELAY = 160;
/** Used only to choose above/below placement before the tooltip has laid out. */
const ESTIMATED_TOOLTIP_HEIGHT = 210;
const MIN_TOOLTIP_HEIGHT = 140;

function rectsAgree(a: TargetRect, b: TargetRect) {
  return (
    Math.abs(a.x - b.x) <= MEASURE_EPSILON &&
    Math.abs(a.y - b.y) <= MEASURE_EPSILON &&
    Math.abs(a.width - b.width) <= MEASURE_EPSILON &&
    Math.abs(a.height - b.height) <= MEASURE_EPSILON
  );
}

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
 * is hardcoded — and the overlay is an absolutely-positioned sibling of the
 * screen content (not a Modal) so measured window coordinates and the overlay
 * share one coordinate space, with the overlay's own origin subtracted to stay
 * exact under a translucent status bar.
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
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);

  const geometry = useRef({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    width: new Animated.Value(0),
    height: new Animated.Value(0),
  }).current;
  const rootRef = useRef<View>(null);
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

    /**
     * Resolves once the target reports the same rect twice in a row, so the
     * spotlight is never positioned from a mid-scroll or pre-layout value.
     */
    const measureSettled = async (id: string) => {
      let previous: TargetRect | null = null;
      for (let attempt = 0; attempt < MEASURE_ATTEMPTS; attempt += 1) {
        const measured = await measureTarget(id);
        if (cancelled) return null;
        if (measured && previous && rectsAgree(measured, previous)) {
          return measured;
        }
        previous = measured;
        await wait(MEASURE_INTERVAL);
        if (cancelled) return null;
      }
      return previous;
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

      /** Window coordinates of the overlay itself, so targets can be mapped in. */
      const measureOrigin = () =>
        new Promise<{ x: number; y: number }>((resolve) => {
          const node = rootRef.current;
          if (!node || typeof node.measureInWindow !== "function") {
            resolve({ x: 0, y: 0 });
            return;
          }
          node.measureInWindow((x, y) =>
            resolve({
              x: Number.isFinite(x) ? x : 0,
              y: Number.isFinite(y) ? y : 0,
            }),
          );
        });

      let rect = await measureSettled(step.id);
      if (cancelled) return;

      if (rect && ensureTargetVisible) {
        const didScroll = await ensureTargetVisible(rect);
        if (cancelled) return;
        if (didScroll) {
          // Let the scroll actually start before polling, otherwise two
          // pre-scroll samples would look "settled".
          await wait(SCROLL_START_DELAY);
          if (cancelled) return;
          rect = (await measureSettled(step.id)) ?? rect;
          if (cancelled) return;
        }
      }

      if (!rect) {
        // Target never mounted or measured invalid — move on instead of
        // stranding the user on an empty spotlight.
        onNext();
        return;
      }

      const origin = await measureOrigin();
      if (cancelled) return;

      const pad = step.spotlightPadding ?? spacing.xs;
      const padded: TargetRect = {
        x: Math.max(0, rect.x - origin.x - pad),
        y: Math.max(0, rect.y - origin.y - pad),
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
    const needed = tooltipHeight ?? ESTIMATED_TOOLTIP_HEIGHT;

    const spaceBelow =
      windowHeight - insets.bottom - (rect.y + rect.height) - gap;
    const spaceAbove = rect.y - insets.top - gap;
    const placement =
      step?.placement && step.placement !== "auto"
        ? step.placement
        : spaceBelow >= needed || spaceBelow >= spaceAbove
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
          maxHeight: Math.max(MIN_TOOLTIP_HEIGHT, spaceBelow),
        }
      : {
          ...base,
          bottom: windowHeight - rect.y + gap,
          maxHeight: Math.max(MIN_TOOLTIP_HEIGHT, spaceAbove),
        };
  }, [
    target,
    step,
    tooltipHeight,
    windowWidth,
    windowHeight,
    insets.top,
    insets.bottom,
  ]);

  const handleOverlayPress = useCallback(() => {
    // Absorb stray taps: progression is explicit, via the tooltip controls.
  }, []);

  const handleTooltipLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setTooltipHeight((current) =>
      current !== null && Math.abs(current - height) <= 1 ? current : height,
    );
  }, []);

  // Android hardware back exits the walkthrough rather than the screen.
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onSkip();
        return true;
      },
    );
    return () => subscription.remove();
  }, [visible, onSkip]);

  if (!visible || !step) return null;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <View ref={rootRef} style={[StyleSheet.absoluteFill, styles.root]}>
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
            onLayout={handleTooltipLayout}
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Sits above sibling cards, which carry their own Android elevation.
  root: { zIndex: 20, elevation: 24 },
});
