import { supabase } from '@/lib/supabase';
import { z } from 'zod';

/**
 * Warstwa wywołań AI po stronie frontendu.
 * WYŁĄCZNIE przez Edge Function ai-proxy — żadnych bezpośrednich wywołań do dostawców,
 * żadnych kluczy w przeglądarce (ADR-007). To naprawia błąd poprzedniego projektu.
 */

export type AiProvider = 'anthropic' | 'openai' | 'gemini' | 'openrouter';

export interface AiCallParams {
  workspaceId: string;
  provider: AiProvider;
  moduleKey: string;
  prompt: string;
  system?: string;
  maxTokens?: number;
  model?: string;
}

const aiResultSchema = z.object({
  text: z.string(),
  model: z.string(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }).optional().default({ input_tokens: 0, output_tokens: 0 }),
});

export type AiResult = z.infer<typeof aiResultSchema>;

/** Wywołuje model AI przez Edge ai-proxy. Zwraca zwalidowany wynik (Zod na granicy). */
export async function callAi(params: AiCallParams): Promise<AiResult> {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      workspace_id: params.workspaceId,
      provider: params.provider,
      module_key: params.moduleKey,
      prompt: params.prompt,
      system: params.system,
      max_tokens: params.maxTokens,
      model: params.model,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.success) {
    throw new Error(data?.error?.message ?? 'Błąd wywołania AI');
  }

  return aiResultSchema.parse(data.data);
}
