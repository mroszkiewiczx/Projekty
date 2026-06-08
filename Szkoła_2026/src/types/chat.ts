// ============================================================
// src/types/chat.ts
// Typy dla modułu AI Chat Assistant
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    lesson_id?: string;
    context?: string;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
  context?: ChatContext;
}

export interface ChatContext {
  lesson_id?: string;
  lesson_title?: string;
  subject?: string;
  student_level?: string;
  user_role?: string;
  user_id?: string;
}

export interface ChatRequest {
  message: string;
  context?: ChatContext;
}
