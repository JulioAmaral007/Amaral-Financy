import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { MonthKey, MonthSettings } from "@/types/month";

type StoredMonths = Record<MonthKey, MonthSettings>;

function readAll(): StoredMonths {
  return readStorage<StoredMonths>(STORAGE_KEYS.MONTHS, {});
}

export async function getMonthSettings(month: MonthKey): Promise<MonthSettings | null> {
  return readAll()[month] ?? null;
}

/** Ajustes do mês mais recente anterior a `month` — base para um mês ainda sem ajustes próprios. */
export async function getLatestMonthSettingsBefore(month: MonthKey): Promise<MonthSettings | null> {
  const all = readAll();
  const previous = Object.keys(all)
    .filter((key) => key < month)
    .sort();
  const latest = previous[previous.length - 1];
  return latest ? all[latest] : null;
}

export async function saveMonthSettings(settings: MonthSettings): Promise<MonthSettings> {
  writeStorage(STORAGE_KEYS.MONTHS, { ...readAll(), [settings.month]: settings });
  return settings;
}
