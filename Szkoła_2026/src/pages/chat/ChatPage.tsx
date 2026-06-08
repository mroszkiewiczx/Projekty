'use client';

// ============================================================
// src/pages/chat/ChatPage.tsx
// Strona główna AI Chat Assistant
// ============================================================

import { ChatWindow } from '@/modules/chat/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';

export function ChatPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <ChatWindow
        context={{
          user_role: user?.role,
          user_id: user?.id,
        }}
        placeholder="Zapytaj AI o lekcje, uczniów, pedagogikę..."
        className="h-full rounded-none"
      />
    </div>
  );
}
