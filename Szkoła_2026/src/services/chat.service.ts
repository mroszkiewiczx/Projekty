// ============================================================
// src/services/chat.service.ts
// Serwis AI Chat — generowanie odpowiedzi i tytułów sesji
// ============================================================

import { generateWithAnthropic, streamWithAnthropic } from '@/services/ai/anthropic';
import type { ChatContext } from '@/types/chat';

const MAX_RESPONSE_TOKENS = 2000;
const MAX_TITLE_TOKENS = 100;

function buildSystemPrompt(context?: ChatContext): string {
  let prompt =
    `Jesteś ekspertem AI dla nauczycieli i uczniów. ` +
    `Udzielasz jasnych, pomocnych i angażujących odpowiedzi. ` +
    `Jesteś wspierający, zachęcający i masz szeroką wiedzę o edukacji. ` +
    `Zawsze odpowiadaj po polsku (język polski).`;

  if (context?.lesson_title) {
    prompt += `\n\nObecnie omawiamy lekcję: "${context.lesson_title}"`;
    if (context.subject) {
      prompt += ` (przedmiot: ${context.subject})`;
    }
  }

  if (context?.student_level) {
    prompt += `\nPoziom ucznia: ${context.student_level}`;
  }

  if (context?.user_role === 'teacher') {
    prompt += `\nRozmawiasz z nauczycielem — możesz używać bardziej technicznego języka pedagogicznego.`;
  }

  return prompt;
}

export async function chatWithAI(
  message: string,
  context?: ChatContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  if (onChunk) {
    let fullResponse = '';
    await streamWithAnthropic(message, (chunk) => {
      fullResponse += chunk;
      onChunk(chunk);
    }, {
      systemPrompt,
      maxTokens: MAX_RESPONSE_TOKENS,
    });
    return fullResponse;
  }

  return generateWithAnthropic(message, {
    systemPrompt,
    maxTokens: MAX_RESPONSE_TOKENS,
  });
}

export async function generateChatTitle(message: string): Promise<string> {
  const title = await generateWithAnthropic(
    `Wygeneruj krótki tytuł (maks. 5 słów) dla sesji czatu, która zaczyna się od: "${message}"\n\nOdpowiedz tylko tytułem, niczym więcej.`,
    { maxTokens: MAX_TITLE_TOKENS }
  );
  return title.trim();
}
