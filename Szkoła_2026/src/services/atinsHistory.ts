// ============================================================
// src/services/atinsHistory.ts
// Zapis i odczyt historii dokumentów ATINS PKA z Supabase.
// Tabela: atins_documents (migracja 032)
// ============================================================

import { supabase } from "@/lib/supabase";

export type AtinsDocType = "syllabus" | "osf" | "evaluation";
export type AtinsKierunek = "kliniczny" | "biznesowy";

export interface AtinsDocument {
  id: string;
  workspace_id: string;
  user_id: string;
  doc_type: AtinsDocType;
  kierunek: AtinsKierunek | null;
  kurs_kod: string | null;
  osf_dok_id: string | null;
  eval_typ: string | null;
  title: string;
  markdown_content: string;
  eval_result: unknown | null;
  ai_provider: string | null;
  ai_model: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SaveDocumentInput {
  workspace_id: string;
  user_id: string;
  doc_type: AtinsDocType;
  kierunek?: AtinsKierunek | null;
  kurs_kod?: string | null;
  osf_dok_id?: string | null;
  eval_typ?: string | null;
  title: string;
  markdown_content: string;
  eval_result?: unknown | null;
  ai_provider?: string | null;
  ai_model?: string | null;
  metadata?: Record<string, unknown>;
}

/** Zapisuje nowy dokument do historii. Zwraca utworzony rekord lub null przy błędzie. */
export async function saveDocument(input: SaveDocumentInput): Promise<AtinsDocument | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data, error } = await client
    .from("atins_documents")
    .insert(input)
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[atinsHistory] saveDocument error:", error.message);
    return null;
  }
  return data as AtinsDocument;
}

/** Pobiera ostatnie N dokumentów z workspace (najnowsze pierwsze). */
export async function listRecentDocuments(
  workspaceId: string,
  limit = 20,
  docType?: AtinsDocType,
): Promise<AtinsDocument[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("atins_documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (docType) {
    query = query.eq("doc_type", docType);
  }

  const { data, error } = await query;
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[atinsHistory] listRecentDocuments error:", error.message);
    return [];
  }
  return (data ?? []) as AtinsDocument[];
}

/** Pobiera pojedynczy dokument po id. */
export async function getDocument(id: string): Promise<AtinsDocument | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("atins_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as AtinsDocument;
}

/** Usuwa dokument z historii. */
export async function deleteDocument(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("atins_documents")
    .delete()
    .eq("id", id);

  return !error;
}
