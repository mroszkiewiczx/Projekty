// ============================================================
// src/types/aiConfig.ts
// Typy i stałe konfiguracji AI — provider, model, walidacja
// ============================================================

// ── Provider IDs ─────────────────────────────────────────────
export type AiProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "openrouter"
  | "x-ai"
  | "perplexity";

export const VALID_PROVIDERS: AiProvider[] = [
  "openai",
  "anthropic",
  "google",
  "openrouter",
  "x-ai",
  "perplexity",
];

// ── Provider → prefixes / patterns dla walidacji ─────────────
export const PROVIDER_MODEL_PREFIXES: Record<AiProvider, string[]> = {
  openai:      ["openai/", "gpt-", "o3", "o4", "o1"],
  anthropic:   ["anthropic/", "claude-"],
  google:      ["google/", "gemini-"],
  openrouter:  [],               // wszystko trafia do OR jako fallback
  "x-ai":      ["x-ai/"],
  perplexity:  ["perplexity/"],
};

// ── Infer provider z model ID ─────────────────────────────────
export function inferProvider(model: string): AiProvider {
  const m = model.trim().toLowerCase();
  if (m.startsWith("anthropic/") || m.startsWith("claude-"))       return "anthropic";
  if (m.startsWith("google/")    || m.startsWith("gemini-"))       return "google";
  if (m.startsWith("openai/")    || /^(gpt-|o[1-4][-\s])/.test(m)) return "openai";
  if (m.startsWith("perplexity/"))                                   return "perplexity";
  if (m.startsWith("x-ai/"))                                        return "x-ai";
  return "openrouter";
}

// ── Walidacja provider ↔ model ────────────────────────────────
export interface ProviderModelValidation {
  valid: boolean;
  reason?: string;
  suggestedProvider?: AiProvider;
}

export function validateProviderModel(
  provider: AiProvider,
  model: string
): ProviderModelValidation {
  if (!VALID_PROVIDERS.includes(provider)) {
    return { valid: false, reason: `Nieznany provider: ${provider}` };
  }
  if (!model || model.trim() === "") {
    return { valid: false, reason: "Model nie może być pusty" };
  }

  const inferred = inferProvider(model);

  // openrouter akceptuje wszystko
  if ((provider as string) === "openrouter") return { valid: true };

  // Jeśli inferred = openrouter i provider jest specyficzny — OK (bare model name)
  if ((inferred as string) === "openrouter") return { valid: true };

  if (inferred !== provider) {
    return {
      valid: false,
      reason: `Model ${model} wygląda na ${inferred}, nie ${provider}`,
      suggestedProvider: inferred,
    };
  }

  return { valid: true };
}

// ── Finalna mapa modeli per moduł (źródło prawdy) ────────────
export interface ModuleModelMapping {
  moduleId:        string;
  label:           string;
  provider:        AiProvider;
  model:           string;
  fallback:        string;
  priorityLocked:  boolean;
  note?:           string;
}

export const MODULE_MODEL_MAP: ModuleModelMapping[] = [
  {
    moduleId:       "global",
    label:          "Globalny (system)",
    provider:       "openai",
    model:          "openai/gpt-5.4",
    fallback:       "openai/gpt-4o",
    priorityLocked: false,
    note:           "Główny model systemu — OpenAI GPT-5.4 Thinking z browser/tools",
  },
  {
    moduleId:       "briefing",
    label:          "AI Briefing",
    provider:       "google",
    model:          "google/gemini-2.5-flash-preview-05-20",
    fallback:       "openai/gpt-4o",
    priorityLocked: false,
  },
  {
    moduleId:       "content",
    label:          "Generator Treści",
    provider:       "anthropic",
    model:          "anthropic/claude-sonnet-4-6",
    fallback:       "google/gemini-2.5-flash-preview-05-20",
    priorityLocked: false,
  },
  {
    moduleId:       "newsletter",
    label:          "Generator Newslettera",
    provider:       "anthropic",
    model:          "anthropic/claude-sonnet-4-6",
    fallback:       "google/gemini-2.5-flash-preview-05-20",
    priorityLocked: false,
  },
  {
    moduleId:       "docs",
    label:          "Generator Dokumentów",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "anthropic/claude-sonnet-4-6",
    priorityLocked: false,
  },
  {
    moduleId:       "scripts",
    label:          "Skrypty Sprzedażowe",
    provider:       "anthropic",
    model:          "anthropic/claude-sonnet-4-6",
    fallback:       "openai/gpt-4o",
    priorityLocked: false,
  },
  {
    moduleId:       "n8ngen",
    label:          "Generator Automatyzacji",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "anthropic/claude-sonnet-4-6",
    priorityLocked: false,
  },
  {
    moduleId:       "analysis",
    label:          "Analiza Organizacji",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "anthropic/claude-sonnet-4-6",
    priorityLocked: false,
  },
  {
    moduleId:       "ceo",
    label:          "CEO Dashboard AI",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "anthropic/claude-sonnet-4-6",
    priorityLocked: false,
  },
  {
    moduleId:       "compbrief",
    label:          "Analiza Konkurencji",
    provider:       "x-ai",
    model:          "x-ai/grok-3",
    fallback:       "google/gemini-2.5-flash-preview-05-20",
    priorityLocked: false,
  },
  {
    moduleId:       "aisalesinfo",
    label:          "AI Sales Intelligence",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "anthropic/claude-sonnet-4-6",
    priorityLocked: false,
  },
  {
    moduleId:       "leadgen",
    label:          "Lead Generation",
    provider:       "perplexity",
    model:          "perplexity/sonar-pro",
    fallback:       "perplexity/sonar-deep-research",
    priorityLocked: false,
  },
  {
    moduleId:       "transcription",
    label:          "Transkrypcja AI",
    provider:       "openai",
    model:          "openai/gpt-4o",
    fallback:       "google/gemini-2.5-flash-preview-05-20",
    priorityLocked: false,
  },
  {
    moduleId:       "agents",
    label:          "Sales Agents",
    provider:       "anthropic",
    model:          "anthropic/claude-opus-4-6",
    fallback:       "openai/gpt-4o",
    priorityLocked: false,
  },
  {
    moduleId:       "podcast",
    label:          "Generator Podcastów",
    provider:       "anthropic",
    model:          "anthropic/claude-opus-4-6",
    fallback:       "google/gemini-2.5-flash-preview-05-20",
    priorityLocked: true,
    note:           "Oznaczony do osobnej optymalizacji silnika — priorytet zmiany w osobnym wdrożeniu",
  },
];

// ── Szybki lookup moduleId → mapping ─────────────────────────
export const MODULE_MAP_BY_ID = Object.fromEntries(
  MODULE_MODEL_MAP.map((m) => [m.moduleId, m])
) as Record<string, ModuleModelMapping>;

// ── Label providera do UI ─────────────────────────────────────
export const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai:      "OpenAI",
  anthropic:   "Anthropic",
  google:      "Google / Gemini",
  openrouter:  "OpenRouter",
  "x-ai":      "xAI / Grok",
  perplexity:  "Perplexity",
};

// ── Kolory providera do UI (tailwind classes) ─────────────────
export const PROVIDER_COLORS: Record<AiProvider, string> = {
  openai:      "text-green-400 bg-green-950/50",
  anthropic:   "text-orange-400 bg-orange-950/50",
  google:      "text-blue-400 bg-blue-950/50",
  openrouter:  "text-purple-400 bg-purple-950/50",
  "x-ai":      "text-zinc-300 bg-zinc-800/50",
  perplexity:  "text-teal-400 bg-teal-950/50",
};
