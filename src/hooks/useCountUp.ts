import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";


export function useCountUp(target: number, durationMs = 900): number {
  const [display, setDisplay] = useState(target);
  const animatedValue = useRef(new Animated.Value(target)).current;
  const prevTargetRef = useRef(target);

  useEffect(() => {
    if (prevTargetRef.current === target) return;
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplay(Math.round(value));
    });
    animatedValue.setValue(prevTargetRef.current);
    Animated.timing(animatedValue, {
      toValue: target,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    prevTargetRef.current = target;
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [target, durationMs, animatedValue]);

  return display;
}
