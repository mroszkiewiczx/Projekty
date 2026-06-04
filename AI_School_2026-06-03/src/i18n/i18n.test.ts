import { describe, it, expect } from 'vitest';
import pl from './pl.json';
import en from './en.json';

/**
 * Testy kompletności i spójności tłumaczeń.
 * Gwarantują, że pl.json i en.json mają IDENTYCZNY zestaw kluczy —
 * brak tłumaczenia w którymkolwiek języku = błąd (zasada zero hardcoded / pełne i18n).
 */

/** Spłaszcza zagnieżdżony obiekt do listy ścieżek kluczy (np. "auth.errors.emailRequired"). */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe('i18n — kompletność tłumaczeń', () => {
  const plKeys = flattenKeys(pl).sort();
  const enKeys = flattenKeys(en).sort();

  it('pl.json i en.json mają tę samą liczbę kluczy', () => {
    expect(plKeys.length).toBe(enKeys.length);
  });

  it('każdy klucz z PL istnieje w EN', () => {
    const missingInEn = plKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });

  it('każdy klucz z EN istnieje w PL', () => {
    const missingInPl = enKeys.filter((k) => !plKeys.includes(k));
    expect(missingInPl).toEqual([]);
  });

  it('żadna wartość tłumaczenia nie jest pusta', () => {
    const allValues = [
      ...flattenValues(pl as Record<string, unknown>),
      ...flattenValues(en as Record<string, unknown>),
    ];
    const empty = allValues.filter((v) => v.trim() === '');
    expect(empty).toEqual([]);
  });
});

function flattenValues(obj: Record<string, unknown>): string[] {
  return Object.values(obj).flatMap((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenValues(value as Record<string, unknown>);
    }
    return [String(value)];
  });
}
