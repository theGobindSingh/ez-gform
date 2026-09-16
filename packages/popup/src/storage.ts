import type { StoredSettings } from "@ez-gform/types";

const STORAGE_KEY = "ezGformSettings";

export const DEFAULT_SETTINGS: StoredSettings = {
  format: "react",
  typescript: true,
};

export const loadSettings = async (): Promise<StoredSettings> => {
  const stored: Record<string, StoredSettings | undefined> =
    await chrome.storage.sync.get(STORAGE_KEY);
  const partial: StoredSettings | undefined = stored[STORAGE_KEY];
  return { ...DEFAULT_SETTINGS, ...partial };
};

export const saveSettings = async (settings: StoredSettings): Promise<void> => {
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
};
