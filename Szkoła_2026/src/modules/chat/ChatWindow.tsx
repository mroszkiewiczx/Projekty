'use client';

// ============================================================
// src/modules/chat/ChatWindow.tsx
// Główny komponent okna czatu AI — streaming, scroll, input
// ============================================================

import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage, ChatContext } from '@/types/chat';

interface ChatWindowProps {
  context?: ChatContext;
  placeholder?: string;
  className?: string;
}

export function ChatWindow({
  context,
  placeholder = 'Zadaj pytanie AI...',
  className = '',
}: ChatWindowProps) {
  const { messages, isLoading, isStreaming, error, sendMessage, clearChat } = useChat(context);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Nagłówek */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">💬</span>
          <h3 className="text-base font-bold">AI Assistant</h3>
          {context?.lesson_title && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full truncate max-w-[160px]">
              {context.lesson_title}
            </span>
          )}
        </div>
        <button
          onClick={clearChat}
          type="button"
          className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded"
        >
          Nowy czat
        </button>
      </div>

      {/* Lista wiadomości */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 select-none">
            <span className="text-4xl" aria-hidden="true">🤖</span>
            <p className="text-sm">Zacznij rozmowę z AI...</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-gray-500 text-sm pl-1">
            <span>AI pisze</span>
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            Błąd: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit} className="border-t bg-gray-50 px-4 py-3 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shrink-0"
            aria-label="Wyślij wiadomość"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Enter — wyślij &nbsp;·&nbsp; Shift+Enter — nowa linia</p>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {message.content}
        <time
          className={`block text-[10px] mt-1 ${isUser ? 'text-blue-200 text-right' : 'text-gray-400'}`}
          dateTime={message.timestamp.toISOString()}
        >
          {message.timestamp.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
    </div>
  );
}
