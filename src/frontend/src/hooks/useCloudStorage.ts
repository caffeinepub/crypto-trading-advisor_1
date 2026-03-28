import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getAccountKey } from "./useAccountKey";

let actorPromise: Promise<backendInterface> | null = null;

function getActor(): Promise<backendInterface> {
  if (!actorPromise) {
    actorPromise = createActorWithConfig();
  }
  return actorPromise;
}

export function useCloudStorage() {
  const accountKey = getAccountKey();

  async function loadData<T>(dataKey: string, fallback: T): Promise<T> {
    try {
      const actor = await getActor();
      const result = await actor.getUserData(accountKey, dataKey);
      if (result) {
        localStorage.setItem(`cloud_${dataKey}`, result);
        return JSON.parse(result) as T;
      }
      const cached = localStorage.getItem(`cloud_${dataKey}`);
      if (cached) return JSON.parse(cached) as T;
    } catch {}
    return fallback;
  }

  async function saveData(dataKey: string, value: unknown): Promise<void> {
    const json = JSON.stringify(value);
    localStorage.setItem(`cloud_${dataKey}`, json);
    try {
      const actor = await getActor();
      await actor.saveUserData(accountKey, dataKey, json);
    } catch {}
  }

  return { loadData, saveData, accountKey };
}

// Standalone helpers for use outside React components
export async function cloudSave(
  dataKey: string,
  value: unknown,
): Promise<void> {
  const accountKey = getAccountKey();
  const json = JSON.stringify(value);
  localStorage.setItem(`cloud_${dataKey}`, json);
  try {
    const actor = await getActor();
    await actor.saveUserData(accountKey, dataKey, json);
  } catch {}
}

export async function cloudLoad<T>(dataKey: string, fallback: T): Promise<T> {
  const accountKey = getAccountKey();
  try {
    const actor = await getActor();
    const result = await actor.getUserData(accountKey, dataKey);
    if (result) {
      localStorage.setItem(`cloud_${dataKey}`, result);
      return JSON.parse(result) as T;
    }
    const cached = localStorage.getItem(`cloud_${dataKey}`);
    if (cached) return JSON.parse(cached) as T;
  } catch {}
  return fallback;
}
