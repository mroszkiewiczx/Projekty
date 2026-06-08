// ============================================================
// src/services/aiService.ts
// Direct browser-to-API AI calls using stored credentials.
// Priority: OpenAI → Gemini → OpenRouter → Anthropic → error
// ============================================================

import { getCredential, getActiveModel } from "./credentialStore";
import type { AiModuleConfig } from "@/hooks/useAiModules";

export class NoApiKeyError extends Error {
  constructor() {
    super(
      "Brak klucza AI. Skonfiguruj Anthropic, Gemini lub OpenRouter w Ustawienia → Klucze API"
    );
    this.name = "NoApiKeyError";
  }
}

export class AiApiError extends Error {
  constructor(provider: string, status: number, message: string) {
    super(`${provider} error ${status}: ${message}`);
    this.name = "AiApiError";
  }
}

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

const DEFAULT_OPENAI_MODEL = "gpt-4.1";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

// ── OpenRouter ────────────────────────────────────────────────

async function callOpenRouter(
  messages: AIMessage[],
  opts: AIOptions
): Promise<string> {
  const key = getCredential("openrouter");
  if (!key) throw new NoApiKeyError();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "AI Sales OS",
    },
    body: JSON.stringify({
      model: opts.model || getActiveModel(),
      messages,
      max_tokens: opts.maxTokens || 3000,
      temperature: opts.temperature ?? 0.7,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new AiApiError("OpenRouter", res.status, err?.error?.message || res.statusText);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Anthropic ─────────────────────────────────────────────────

async function callAnthropic(
  messages: AIMessage[],
  opts: AIOptions
): Promise<string> {
  const key = getCredential("anthropic");
  if (!key) throw new NoApiKeyError();

  const systemMsg = messages.find(m => m.role === "system")?.content;
  const userMessages = messages.filter(m => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens || 3000,
      temperature: opts.temperature ?? 0.7,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new AiApiError("Anthropic", res.status, err?.error?.message || res.statusText);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// ── Gemini (Google AI Studio) ──────────────────────────────────

async function callGemini(
  messages: AIMessage[],
  opts: AIOptions
): Promise<string> {
  const key = getCredential("gemini");
  if (!key) throw new NoApiKeyError();

  // Google AI Studio OpenAI-compatible endpoint
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_GEMINI_MODEL,
      messages,
      max_tokens: opts.maxTokens || 3000,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new AiApiError("Gemini", res.status, err?.error?.message || res.statusText);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── OpenAI ────────────────────────────────────────────────────

async function callOpenAI(
  messages: AIMessage[],
  opts: AIOptions
): Promise<string> {
  const key = getCredential("openai");
  if (!key) throw new NoApiKeyError();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_OPENAI_MODEL,
      messages,
      max_tokens: opts.maxTokens || 3000,
      temperature: opts.temperature ?? 0.7,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new AiApiError("OpenAI", res.status, err?.error?.message || res.statusText);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Model-aware routing ───────────────────────────────────────
//
// Detects provider from model ID prefix and routes to the direct API.
// Falls back to OpenRouter when the direct key is unavailable.
//
// Supported prefixes → provider:
//   "anthropic/" or "claude-*"           → Anthropic direct
//   "google/"    or "gemini-*"           → Gemini (Google AI Studio) direct
//   "openai/"    or "gpt-*"/"o1|o3|o4*" → OpenAI direct
//   "perplexity/..."                     → OpenRouter (Perplexity has no browser CORS)
//   everything else                      → OpenRouter
//
// DEFAULTS should use bare model names (no provider prefix):
//   "claude-sonnet-4-6", "gemini-2.5-pro-preview-05-06", "gpt-5.4"
// Perplexity models keep prefix since they always go via OpenRouter:
//   "perplexity/sonar-pro", "perplexity/sonar-deep-research"

type Provider = "anthropic" | "gemini" | "openai" | "openrouter";

// OpenRouter prefix for each provider (used when falling back from direct → OR)
const OR_PREFIX: Record<Provider, string> = {
  anthropic:   "anthropic/",
  gemini:      "google/",
  openai:      "openai/",
  openrouter:  "",           // bare model is already the full OR model ID
};

function detectProvider(model: string): { provider: Provider; bareModel: string } {
  const m = model.trim();

  // Explicit provider prefixes
  if (m.startsWith("anthropic/")) return { provider: "anthropic", bareModel: m.slice("anthropic/".length) };
  if (m.startsWith("google/"))    return { provider: "gemini",    bareModel: m.slice("google/".length)    };
  if (m.startsWith("openai/"))    return { provider: "openai",    bareModel: m.slice("openai/".length)    };
  // Perplexity / x-ai / other OpenRouter-only providers
  if (m.startsWith("perplexity/")) return { provider: "openrouter", bareModel: m };
  if (m.startsWith("x-ai/"))       return { provider: "openrouter", bareModel: m };

  // Pattern-based detection (bare model names without prefix)
  if (/^claude-/i.test(m))             return { provider: "anthropic", bareModel: m };
  if (/^gemini-/i.test(m))             return { provider: "gemini",    bareModel: m };
  if (/^(gpt-|o1[-\s]|o3[-\s]|o4[-\s])/i.test(m)) return { provider: "openai", bareModel: m };

  // Unknown → OpenRouter
  return { provider: "openrouter", bareModel: m };
}

async function routeByModel(
  messages: AIMessage[],
  opts: AIOptions
): Promise<string> {
  if (!opts.model) {
    // No model specified — use priority: OpenAI → Gemini → OpenRouter → Anthropic
    if (getCredential("openai"))     return callOpenAI(messages,    { ...opts, model: DEFAULT_OPENAI_MODEL    });
    if (getCredential("gemini"))     return callGemini(messages,    { ...opts, model: DEFAULT_GEMINI_MODEL    });
    if (getCredential("openrouter")) return callOpenRouter(messages, opts);
    if (getCredential("anthropic"))  return callAnthropic(messages,  { ...opts, model: DEFAULT_ANTHROPIC_MODEL });
    throw new NoApiKeyError();
  }

  const { provider, bareModel } = detectProvider(opts.model);
  const directOpts = { ...opts, model: bareModel };
  const orModel    = OR_PREFIX[provider] + bareModel;  // reconstruct OR format for fallback
  const orOpts     = { ...opts, model: orModel };

  switch (provider) {
    case "anthropic":
      if (getCredential("anthropic"))  return callAnthropic(messages, directOpts);
      if (getCredential("openrouter")) return callOpenRouter(messages, orOpts);
      break;
    case "gemini":
      if (getCredential("gemini"))     return callGemini(messages,    directOpts);
      if (getCredential("openrouter")) return callOpenRouter(messages, orOpts);
      break;
    case "openai":
      if (getCredential("openai"))     return callOpenAI(messages,    directOpts);
      if (getCredential("openrouter")) return callOpenRouter(messages, orOpts);
      break;
    case "openrouter":
      if (getCredential("openrouter")) return callOpenRouter(messages, orOpts);
      break;
  }

  throw new NoApiKeyError();
}

// ── Public API ────────────────────────────────────────────────

export async function generateText(
  prompt: string,
  opts: AIOptions = {}
): Promise<string> {
  const messages: AIMessage[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: "system", content: opts.systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  return routeByModel(messages, opts);
}

function tryParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractFencedJson<T>(value: string): T | null {
  const fencedMatch = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (!fencedMatch) return null;
  return tryParseJson<T>(fencedMatch[1].trim());
}

function extractBalancedJson<T>(value: string): T | null {
  const starts = new Set(["{", "["]);

  for (let startIndex = 0; startIndex < value.length; startIndex++) {
    if (!starts.has(value[startIndex])) continue;

    const opening = value[startIndex];
    const closing = opening === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let currentIndex = startIndex; currentIndex < value.length; currentIndex++) {
      const char = value[currentIndex];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === opening) depth += 1;
      if (char === closing) depth -= 1;

      if (depth === 0) {
        const candidate = value.slice(startIndex, currentIndex + 1);
        const parsed = tryParseJson<T>(candidate);
        if (parsed !== null) return parsed;
        break;
      }
    }
  }

  return null;
}

export async function generateJSON<T>(
  prompt: string,
  opts: AIOptions = {}
): Promise<T> {
  const raw = await generateText(prompt, { ...opts, jsonMode: true });
  const normalized = raw.trim();
  const direct = tryParseJson<T>(normalized);
  if (direct !== null) return direct;

  const fenced = extractFencedJson<T>(normalized);
  if (fenced !== null) return fenced;

  const balanced = extractBalancedJson<T>(normalized);
  if (balanced !== null) return balanced;

  throw new Error("AI nie zwrócił poprawnego JSON");
}

export { hasAnyAiKey } from "./credentialStore";

// ── generateTextForModule ─────────────────────────────────
//
// Wywołuje AI dla konkretnego modułu używając jego konfiguracji
// (model, system_prompt, temperature, max_tokens) z fallback na model2.
//
// Użycie:
//   const text = await generateTextForModule(moduleConfig, userPrompt);
//   const text = await generateTextForModule(moduleConfig, userPrompt, { maxTokens: 5000 });
//
export async function generateTextForModule(
  cfg: Pick<AiModuleConfig, "model" | "model2" | "system_prompt" | "temperature" | "max_tokens">,
  userPrompt: string,
  overrides: Partial<AIOptions> = {}
): Promise<string> {
  const opts: AIOptions = {
    model:        overrides.model        ?? cfg.model,
    temperature:  overrides.temperature  ?? cfg.temperature,
    maxTokens:    overrides.maxTokens    ?? cfg.max_tokens,
    systemPrompt: overrides.systemPrompt ?? (cfg.system_prompt || undefined),
    ...overrides,
  };

  try {
    return await generateText(userPrompt, opts);
  } catch (err) {
    // Fallback na model2 jeśli primary się nie powiódł
    const fallback = cfg.model2;
    if (fallback && fallback !== cfg.model) {
      console.warn(`[aiService] Primary model ${cfg.model} failed, trying fallback ${fallback}:`, err);
      return generateText(userPrompt, { ...opts, model: fallback });
    }
    throw err;
  }
}
