import { useEffect, useState } from "react";
import type { DashboardData } from "../types";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: DashboardData };

export function useData(): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    // base-relative so it works under any deploy path
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: DashboardData) => alive && setState({ status: "ready", data }))
      .catch((e) => alive && setState({ status: "error", error: String(e) }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
