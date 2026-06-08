// ============================================================
// src/services/credentialStore.ts
// Reads/writes API keys from localStorage (DEV mode credential store)
// In production, keys live in Supabase encrypted — this is the DEV bridge
// Keys are base64-obfuscated to prevent plaintext exposure in DevTools.
// ============================================================

const PREFIX = "api_key_";
const CONFIG_PREFIX = "api_config_";

function obfuscate(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function extractLegacyCredential(value: string): string | null {
  try {
    const parsed = JSON.parse(value) as { apiKey?: string };
    return typeof parsed.apiKey === "string" ? parsed.apiKey : null;
  } catch {
    return null;
  }
}

function deobfuscate(value: string): string {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    const legacyCredential = extractLegacyCredential(value);
    if (legacyCredential) return legacyCredential;
    // legacy plaintext fallback (pre-obfuscation keys)
    return value;
  }
}

export function getCredential(provider: string): string | null {
  const raw = localStorage.getItem(`${PREFIX}${provider}`);
  return raw ? deobfuscate(raw) : null;
}

export function setCredential(provider: string, key: string, extra?: Record<string, string>): void {
  localStorage.setItem(`${PREFIX}${provider}`, obfuscate(key));
  if (extra) {
    localStorage.setItem(`${CONFIG_PREFIX}${provider}`, JSON.stringify(extra));
  }
}

export function removeCredential(provider: string): void {
  localStorage.removeItem(`${PREFIX}${provider}`);
  localStorage.removeItem(`${CONFIG_PREFIX}${provider}`);
}

export function getCredentialConfig(provider: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(`${CONFIG_PREFIX}${provider}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasCredential(provider: string): boolean {
  const v = getCredential(provider);
  return !!v && v.trim().length > 0;
}

export function getActiveModel(): string {
  return (
    localStorage.getItem("ai_active_model") ||
    "gpt-4.1"
  );
}

export function setActiveModel(model: string): void {
  localStorage.setItem("ai_active_model", model);
}

export function hasAnyAiKey(): boolean {
  return (
    hasCredential("openrouter") ||
    hasCredential("openai") ||
    hasCredential("anthropic") ||
    hasCredential("gemini")
  );
}

export function hasTranscriptionKey(): boolean {
  return hasCredential("deepgram") || hasCredential("assemblyai");
}
