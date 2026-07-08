import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DashboardData, Lens } from "./types";
import type { LensCtx } from "./lib/transform";

interface Store {
  data: DashboardData;
  country: string;
  setCountry: (c: string) => void;
  lens: Lens;
  setLens: (l: Lens) => void;
  wastage: number; // 0..0.5
  setWastage: (w: number) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  /** context for the transform helpers, derived from costConfig + slider */
  ctx: LensCtx;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({
  data,
  children,
}: {
  data: DashboardData;
  children: ReactNode;
}) {
  const [country, setCountry] = useState(data.countries[0]);
  const [lens, setLens] = useState<Lens>("cost");
  const [wastage, setWastage] = useState(data.costConfig.defaultWastage);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const ctx = useMemo<LensCtx>(
    () => ({ cost: data.costConfig, wastage }),
    [data.costConfig, wastage]
  );

  const value = useMemo<Store>(
    () => ({ data, country, setCountry, lens, setLens, wastage, setWastage, dark, setDark, ctx }),
    [data, country, lens, wastage, dark, ctx]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
