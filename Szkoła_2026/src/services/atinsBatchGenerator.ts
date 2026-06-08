// ============================================================
// src/services/atinsBatchGenerator.ts
// Batch generowanie sylabusów ATINS — kolejka + ZIP
// ============================================================

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Document, Packer } from "docx";
import { generateText } from "@/services/aiService";
import { buildSyllabusPrompt } from "@/data/atins/prompts";
import type { Kurs, Kierunek, KierunekDef } from "@/data/atins/moduly";
import type { SyllabusFormInput } from "@/data/atins/schemas";

/** Status pojedynczego zadania w batchu. */
export type BatchItemStatus = "pending" | "generating" | "completed" | "failed";

export interface BatchItem {
  kursKod: string;
  kursNazwa: string;
  status: BatchItemStatus;
  markdown?: string;
  error?: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}

interface RunBatchOptions {
  kierunek: KierunekDef;
  kursy: Kurs[];
  defaultProwadzacy: string;
  defaultStopien: SyllabusFormInput["stopien"];
  onProgress?: (items: BatchItem[], progress: BatchProgress) => void;
  signal?: AbortSignal;
}

/** Tworzy SyllabusFormInput z danych kursu i defaultów. */
function buildInput(
  kierunek: Kierunek,
  kurs: Kurs,
  prowadzacy: string,
  stopien: SyllabusFormInput["stopien"],
  modulKod: string,
): SyllabusFormInput {
  return {
    kierunek,
    modulKod,
    kursKod: kurs.kod,
    kursNazwa: kurs.nazwa,
    ects: kurs.ects,
    godzinyW: kurs.godzinyW,
    godzinyC: kurs.godzinyC,
    semestr: kurs.semestr,
    formaZaliczenia: kurs.formaZaliczenia,
    prowadzacy,
    stopien,
  };
}

/** Znajduje moduł dla kursu w kierunku. */
function findModuleForKurs(kierunek: KierunekDef, kursKod: string): string {
  for (const modul of kierunek.moduly) {
    if (modul.kursy.some((k) => k.kod === kursKod)) return modul.kod;
  }
  return "";
}

/**
 * Generuje serię sylabusów sekwencyjnie (nie równolegle — aby uniknąć rate limit AI).
 * Po każdym wygenerowanym kursie wywoła onProgress z aktualnym stanem.
 *
 * Zwraca listę items z markdown i błędami (jeśli były).
 */
export async function runBatch(opts: RunBatchOptions): Promise<BatchItem[]> {
  const items: BatchItem[] = opts.kursy.map((k) => ({
    kursKod: k.kod,
    kursNazwa: k.nazwa,
    status: "pending",
  }));

  const progress: BatchProgress = { total: items.length, completed: 0, failed: 0 };

  opts.onProgress?.(items, progress);

  for (let i = 0; i < opts.kursy.length; i++) {
    if (opts.signal?.aborted) break;

    const kurs = opts.kursy[i];
    const modulKod = findModuleForKurs(opts.kierunek, kurs.kod);

    items[i].status = "generating";
    progress.current = `${kurs.kod} ${kurs.nazwa}`;
    opts.onProgress?.(items, progress);

    try {
      const input = buildInput(
        opts.kierunek.id,
        kurs,
        opts.defaultProwadzacy,
        opts.defaultStopien,
        modulKod,
      );
      const prompt = buildSyllabusPrompt(input);
      const markdown = await generateText(prompt, {
        maxTokens: 4000,
        temperature: 0.4,
      });
      items[i].status = "completed";
      items[i].markdown = markdown;
      progress.completed++;
    } catch (e: unknown) {
      items[i].status = "failed";
      items[i].error = e instanceof Error ? e.message : "Nieznany błąd";
      progress.failed++;
    }

    opts.onProgress?.(items, progress);
  }

  progress.current = undefined;
  opts.onProgress?.(items, progress);

  return items;
}

/**
 * Pakuje wyniki batcha do ZIP i pobiera.
 * Zawartość:
 *  - SYL_<kursKod>_<nazwa>.docx — sylabusy które się powiodły (DOCX format ATINS)
 *  - SYL_<kursKod>_<nazwa>.md — markdown źródłowy dla każdego sylabusu
 *  - _BLEDY.txt — lista kursów które nie udało się wygenerować (jeśli były)
 *  - README.txt — metadane batcha
 */
export async function packBatchAsZip(
  items: BatchItem[],
  kierunek: KierunekDef,
): Promise<void> {
  const zip = new JSZip();

  // Import dynamiczny exportera (zmniejsza początkowy bundle)
  const { exportSyllabusToDocxBlob } = await import("@/services/atinsDocxExporter");

  const completed = items.filter((i) => i.status === "completed" && i.markdown);
  const failed = items.filter((i) => i.status === "failed");

  // .docx + .md per sukces
  for (const item of completed) {
    const safeNazwa = item.kursNazwa.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const baseName = `SYL_${item.kursKod}_${safeNazwa}`;

    // Markdown
    zip.file(`${baseName}.md`, item.markdown!);

    // DOCX
    const docxBlob = await exportSyllabusToDocxBlob({
      markdownContent: item.markdown!,
      kierunekNazwa: kierunek.nazwa,
      kursKod: item.kursKod,
      kursNazwa: item.kursNazwa,
    });
    zip.file(`${baseName}.docx`, docxBlob);
  }

  // Błędy
  if (failed.length > 0) {
    const errLines = failed.map(
      (i) => `${i.kursKod} — ${i.kursNazwa}: ${i.error ?? "nieznany błąd"}`,
    );
    zip.file("_BLEDY.txt", errLines.join("\n"));
  }

  // README
  const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");
  zip.file(
    "README.txt",
    [
      `Batch sylabusów ATINS PKA`,
      `Wygenerowano: ${dateStr}`,
      `Kierunek: ${kierunek.nazwa} (${kierunek.id})`,
      `Łącznie kursów: ${items.length}`,
      `Sukces: ${completed.length}`,
      `Błędy: ${failed.length}`,
      ``,
      `Pliki .docx i .md są w formacie ATINS (Arial, kolor #1A5276, marginesy 2.5/2.0cm).`,
      `Każdy kurs ma osobny plik .docx (gotowy do PKA) oraz .md (źródło markdown).`,
      failed.length > 0 ? `Lista błędów: _BLEDY.txt` : ``,
    ].filter(Boolean).join("\n"),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = `ATINS_Sylabusy_${kierunek.id}_${new Date().toISOString().slice(0, 10)}.zip`;
  saveAs(blob, fileName);
}
