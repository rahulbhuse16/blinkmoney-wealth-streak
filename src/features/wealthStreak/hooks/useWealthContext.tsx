import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { wealthService } from "../services/wealthService";
import { InvestmentResult, WealthProfile } from "../types";

interface WealthContextValue {
  profile: WealthProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  investToday: (amount: number) => Promise<InvestmentResult>;
  lastInvestmentResult: InvestmentResult | null;
}

const WealthContext = createContext<WealthContextValue | undefined>(undefined);

export function WealthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<WealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastInvestmentResult, setLastInvestmentResult] =
    useState<InvestmentResult | null>(null);

  // Guards against setting state after unmount / stale async responses.
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadProfile = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await wealthService.getWealthProfile();
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setProfile(data);
    } catch (e) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setError(
        e instanceof Error ? e.message : "Couldn't load your wealth journey.",
      );
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const investToday = useCallback(async (amount: number) => {
    const result = await wealthService.invest(amount);
    if (isMountedRef.current) {
      setLastInvestmentResult(result);
      // Refresh profile in the background to stay in sync with the mock backend.
      wealthService.getWealthProfile().then((p) => {
        if (isMountedRef.current) setProfile(p);
      });
    }
    return result;
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      error,
      loadProfile,
      investToday,
      lastInvestmentResult,
    }),
    [profile, isLoading, error, loadProfile, investToday, lastInvestmentResult],
  );

  return (
    <WealthContext.Provider value={value}>{children}</WealthContext.Provider>
  );
}

export function useWealthContext(): WealthContextValue {
  const ctx = useContext(WealthContext);
  if (!ctx) {
    throw new Error("useWealthContext must be used within a WealthProvider");
  }
  return ctx;
}
