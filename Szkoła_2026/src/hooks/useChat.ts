// ============================================================
// src/hooks/useChat.ts
// Hook zarządzający stanem sesji AI Chat z obsługą streamingu
// ============================================================

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatSession, ChatContext } from '@/types/chat';
import { chatWithAI, generateChatTitle } from '@/services/chat.service';

interface UseChatReturn {
  messages: ChatMessage[];
  session: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

function createMessage(role: ChatMessage['role'], content: string, id?: string): ChatMessage {
  return {
    id: id ?? `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date(),
  };
}

const STREAMING_ID = 'assistant-streaming';

export function useChat(initialContext?: ChatContext): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstMessage = useRef(true);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;

      setError(null);
      setIsLoading(true);

      const userMessage = createMessage('user', content);
      setMessages((prev) => [...prev, userMessage]);

      try {
        let assistantContent = '';
        setIsStreaming(true);

        await chatWithAI(content, initialContext, (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const withoutStreaming = prev.filter((m) => m.id !== STREAMING_ID);
            return [
              ...withoutStreaming,
              createMessage('assistant', assistantContent, STREAMING_ID),
            ];
          });
        });

        // Zamień tymczasowy streaming-id na finalny
        const finalId = `assistant-${Date.now()}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === STREAMING_ID ? { ...m, id: finalId } : m
          )
        );

        if (isFirstMessage.current) {
          isFirstMessage.current = false;
          const title = await generateChatTitle(content);
          setSession({
            id: `session-${Date.now()}`,
            user_id: initialContext?.user_id ?? 'anonymous',
            title,
            messages: [],
            created_at: new Date(),
            updated_at: new Date(),
            context: initialContext,
          });
        } else {
          setSession((prev) =>
            prev ? { ...prev, updated_at: new Date() } : prev
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Nieznany błąd podczas generowania odpowiedzi';
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== STREAMING_ID));
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [initialContext]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSession(null);
    setError(null);
    isFirstMessage.current = true;
  }, []);

  return { messages, session, isLoading, isStreaming, error, sendMessage, clearChat };
}
