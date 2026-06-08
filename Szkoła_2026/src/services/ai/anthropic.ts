// ============================================================
// src/services/ai/anthropic.ts
// Bezpośrednie wywołania Anthropic API z przeglądarki.
// Klucz pobierany z credentialStore (localStorage).
// ============================================================

import { getCredential } from '../credentialStore';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

export class AnthropicApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(`Anthropic error ${status}: ${message}`);
    this.name = 'AnthropicApiError';
  }
}

export class AnthropicKeyMissingError extends Error {
  constructor() {
    super('Brak klucza Anthropic API. Skonfiguruj go w Ustawienia → Klucze API.');
    this.name = 'AnthropicKeyMissingError';
  }
}

export interface AnthropicOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

function getApiKey(): string {
  const key = getCredential('anthropic');
  if (!key) throw new AnthropicKeyMissingError();
  return key;
}

export async function generateWithAnthropic(
  prompt: string,
  options: AnthropicOptions = {}
): Promise<string> {
  const apiKey = getApiKey();
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2000,
    temperature = 0.7,
    systemPrompt,
  } = options;

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AnthropicApiError(response.status, errorText);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) throw new Error('Brak odpowiedzi tekstowej z Anthropic API');

  return textBlock.text;
}

export async function streamWithAnthropic(
  prompt: string,
  onChunk: (chunk: string) => void,
  options: AnthropicOptions = {}
): Promise<void> {
  const apiKey = getApiKey();
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2000,
    temperature = 0.7,
    systemPrompt,
  } = options;

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AnthropicApiError(response.status, errorText);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Brak stream reader w odpowiedzi');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;

      try {
        const event = JSON.parse(raw) as {
          type: string;
          delta?: { type: string; text: string };
        };
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          onChunk(event.delta.text);
        }
      } catch {
        // ignoruj niepełne linie SSE
      }
    }
  }
}
