import { useSyncExternalStore } from "react";
import { getPrefs, setPref, subscribePrefs } from "../lib/prefs";

export function usePrefs() {
  const prefs = useSyncExternalStore(subscribePrefs, getPrefs, getPrefs);
  return { prefs, setPref };
}
