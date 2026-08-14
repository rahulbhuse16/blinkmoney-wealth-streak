import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

import { TargetRect } from "./walkthroughTypes";

/**
 * Registers walkthrough targets and measures them on demand.
 *
 * Nothing here is persisted and no state is stored — refs only — so attaching
 * a target to an existing component never causes it to re-render.
 */
export function useWalkthroughTargets() {
  const targetsRef = useRef<Record<string, View | null>>({});

  const setTargetRef = useCallback(
    (id: string) => (node: View | null) => {
      if (node) targetsRef.current[id] = node;
      else delete targetsRef.current[id];
    },
    [],
  );

  const measureTarget = useCallback(
    (id: string) =>
      new Promise<TargetRect | null>((resolve) => {
        const node = targetsRef.current[id];
        if (!node || typeof node.measureInWindow !== "function") {
          resolve(null);
          return;
        }
        try {
          node.measureInWindow((x, y, width, height) => {
            const valid =
              [x, y, width, height].every(Number.isFinite) &&
              width > 0 &&
              height > 0;
            resolve(valid ? { x, y, width, height } : null);
          });
        } catch {
          resolve(null);
        }
      }),
    [],
  );

  return useMemo(
    () => ({ setTargetRef, measureTarget }),
    [setTargetRef, measureTarget],
  );
}

export interface WalkthroughController {
  isVisible: boolean;
  currentStep: number;
  /** Starts the walkthrough at most once per mounted session. */
  startOnce: () => void;
  next: () => void;
  back: () => void;
  /** Closes the walkthrough (skip or "Got it") for this mounted session. */
  dismiss: () => void;
}

/**
 * In-memory walkthrough state. Intentionally NOT persisted: on a fresh app
 * launch the walkthrough is eligible to run again.
 */
export function useWalkthroughState(stepCount: number): WalkthroughController {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // Guards re-entry after a skip/completion within this mounted session.
  const hasStartedRef = useRef(false);

  const startOnce = useCallback(() => {
    if (hasStartedRef.current || stepCount <= 0) return;
    hasStartedRef.current = true;
    setCurrentStep(0);
    setIsVisible(true);
  }, [stepCount]);

  const dismiss = useCallback(() => setIsVisible(false), []);

  const next = useCallback(() => {
    if (currentStep >= stepCount - 1) {
      setIsVisible(false);
      return;
    }
    setCurrentStep(currentStep + 1);
  }, [currentStep, stepCount]);

  const back = useCallback(
    () => setCurrentStep((step) => Math.max(0, step - 1)),
    [],
  );

  return useMemo(
    () => ({ isVisible, currentStep, startOnce, next, back, dismiss }),
    [isVisible, currentStep, startOnce, next, back, dismiss],
  );
}

interface EnsureVisibleOptions {
  topInset?: number;
  bottomInset?: number;
}

/**
 * Keeps walkthrough targets inside the viewport of a scrollable screen so the
 * spotlight never points at off-screen content.
 */
export function useWalkthroughScroll(
  scrollRef: React.RefObject<ScrollView>,
  { topInset = 96, bottomInset = 300 }: EnsureVisibleOptions = {},
) {
  const offsetRef = useRef(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const ensureTargetVisible = useCallback(
    async (rect: TargetRect) => {
      const scroll = scrollRef.current;
      if (!scroll) return false;

      const { height } = Dimensions.get("window");
      const bottomLimit = height - bottomInset;
      let delta = 0;

      if (rect.y < topInset) {
        delta = rect.y - topInset;
      } else if (rect.y + rect.height > bottomLimit) {
        // Never scroll so far that the top of the target leaves the viewport.
        delta = Math.min(rect.y - topInset, rect.y + rect.height - bottomLimit);
      }

      if (Math.abs(delta) < 4) return false;

      scroll.scrollTo({
        y: Math.max(0, offsetRef.current + delta),
        animated: true,
      });
      return true;
    },
    [scrollRef, topInset, bottomInset],
  );

  return useMemo(
    () => ({ onScroll, ensureTargetVisible }),
    [onScroll, ensureTargetVisible],
  );
}
