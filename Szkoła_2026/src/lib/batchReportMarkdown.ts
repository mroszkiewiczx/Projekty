// src/lib/batchReportMarkdown.ts
// Generuje zbiorczy raport Markdown z ocen prac studenckich

export interface BatchReportEntry {
  fileName: string;
  studentName: string;
  thesisTopic: string;
  score: number;
  grade: string;
  aiProbability: number;
  recommendation: string;
  reviewFileId?: string;
  error?: string;
}

export interface BatchReportSummary {
  folderName: string;
  processedAt: string;
  total: number;
  processed: number;
  failed: number;
  entries: BatchReportEntry[];
}

// ── Stałe ────────────────────────────────────────────────────────────────────

const GRADE_LABELS: Record<string, string> = {
  bdb: "bdb (bardzo dobry)",
  "db+": "db+ (dobry plus)",
  db: "db (dobry)",
  "dst+": "dst+ (dostateczny +)",
  dst: "dst (dostateczny)",
  ndst: "ndst (niedostateczny)",
};

const GRADE_ORDER = ["bdb", "db+", "db", "dst+", "dst", "ndst"];

const AI_HIGH_THRESHOLD = 60;

// ── Pomocnicze ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function truncateTopic(topic: string, maxLen = 60): string {
  if (topic.length <= maxLen) return topic;
  return topic.slice(0, maxLen) + "...";
}

function roundOne(n: number): string {
  return n.toFixed(1);
}

function calcMedian(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
}

function percent(count: number, total: number): string {
  if (total === 0) return "0.0%";
  return roundOne((count / total) * 100) + "%";
}

// ── Główna funkcja ────────────────────────────────────────────────────────────

export function generateBatchReport(summary: BatchReportSummary): string {
  const { folderName, processedAt, total, processed, failed, entries } = summary;

  const validEntries = entries.filter((e) => e.error === undefined);
  const errorEntries = entries.filter((e) => e.error !== undefined);

  // Statystyki ocen
  const gradeCounts: Record<string, number> = {};
  for (const grade of GRADE_ORDER) {
    gradeCounts[grade] = 0;
  }
  const scores: number[] = [];
  let totalAI = 0;

  for (const e of validEntries) {
    const gradeKey = e.grade.toLowerCase();
    if (gradeKey in gradeCounts) {
      gradeCounts[gradeKey]++;
    }
    scores.push(e.score);
    totalAI += e.aiProbability;
  }

  const avgScore = scores.length > 0 ? roundOne(scores.reduce((a, b) => a + b, 0) / scores.length) : "0.0";
  const median = calcMedian(scores);
  const avgAI = validEntries.length > 0 ? roundOne(totalAI / validEntries.length) : 0;

  // Prace wymagające uwagi
  const highAIEntries = validEntries.filter((e) => e.aiProbability > AI_HIGH_THRESHOLD);
  const ndstEntries = validEntries.filter((e) => e.grade.toLowerCase() === "ndst");

  // Prace z wysoką oceną (bdb lub db+)
  const topGradeCount = (gradeCounts["bdb"] ?? 0) + (gradeCounts["db+"] ?? 0);
  const requiresVerificationCount = (gradeCounts["dst+"] ?? 0) + (gradeCounts["dst"] ?? 0) + (gradeCounts["ndst"] ?? 0);
  const ndstCount = gradeCounts["ndst"] ?? 0;

  const lines: string[] = [];

  // ── Nagłówek ─────────────────────────────────────────────────────────────────
  lines.push("# Raport Zbiorczy — Ocena Prac Studenckich");
  lines.push("");
  lines.push(`> 📅 Wygenerowano: ${formatDateTime(processedAt)}`);
  lines.push(`> 📁 Folder źródłowy: ${folderName}`);
  lines.push(`> 📊 Przetworzone: ${processed} / ${total} (${failed} błędów)`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Statystyki ogólne ─────────────────────────────────────────────────────────
  lines.push("## Statystyki Ogólne");
  lines.push("");
  lines.push("| Ocena | Ilość | Procent |");
  lines.push("|-------|-------|---------|");
  for (const grade of GRADE_ORDER) {
    const count = gradeCounts[grade] ?? 0;
    const label = GRADE_LABELS[grade] ?? grade;
    lines.push(`| ${label} | ${count} | ${percent(count, validEntries.length)} |`);
  }
  lines.push("");
  lines.push(`**Średnia punktowa:** ${avgScore} / 100`);
  lines.push(`**Mediana:** ${median}`);
  lines.push(`**Średnie prawdopodobieństwo AI:** ${avgAI}%`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Prace wymagające uwagi ───────────────────────────────────────────────────
  lines.push("## ⚠️ Prace Wymagające Szczególnej Uwagi");
  lines.push("");
  lines.push("### Wysokie prawdopodobieństwo treści AI (> 60%)");
  if (highAIEntries.length === 0) {
    lines.push("Brak prac z wysokim prawdopodobieństwem AI");
  } else {
    for (const e of highAIEntries) {
      lines.push(`- **${e.studentName}** — AI: ${e.aiProbability}%, Ocena: ${e.grade}, Temat: ${truncateTopic(e.thesisTopic)}`);
    }
  }
  lines.push("");
  lines.push("### Oceny niedostateczne");
  if (ndstEntries.length === 0) {
    lines.push("Brak prac z oceną niedostateczną");
  } else {
    for (const e of ndstEntries) {
      lines.push(`- **${e.studentName}** — ${e.score}pkt, Temat: ${truncateTopic(e.thesisTopic)}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Lista wszystkich prac ────────────────────────────────────────────────────
  lines.push("## Lista Wszystkich Prac");
  lines.push("");
  lines.push("| Lp. | Student | Temat pracy | Ocena | Punkty | AI% | Rekomendacja |");
  lines.push("|-----|---------|-------------|-------|--------|-----|--------------|");

  let lp = 1;
  for (const e of entries) {
    if (e.error !== undefined) {
      lines.push(`| ${lp} | ${e.fileName} | ❌ Błąd przetwarzania | — | — | — | — |`);
    } else {
      const topic = truncateTopic(e.thesisTopic).replace(/\|/g, "\\|");
      const rec = e.recommendation.replace(/\|/g, "\\|");
      lines.push(`| ${lp} | ${e.studentName} | ${topic} | ${e.grade} | ${e.score} | ${e.aiProbability}% | ${rec} |`);
    }
    lp++;
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Podsumowanie ─────────────────────────────────────────────────────────────
  lines.push("## Podsumowanie");
  lines.push("");
  lines.push(`Spośród **${processed}** przeanalizowanych prac:`);
  lines.push(`- **${topGradeCount}** uzyskało ocenę bardzo dobrą lub dobrą plus (${percent(topGradeCount, validEntries.length)})`);
  lines.push(`- **${requiresVerificationCount}** wymaga poprawek lub dodatkowej weryfikacji (${percent(requiresVerificationCount, validEntries.length)})`);
  lines.push(`- **${highAIEntries.length}** wykazuje wysokie prawdopodobieństwo użycia AI (${percent(highAIEntries.length, validEntries.length)})`);

  if (Number(avgAI) > 50) {
    lines.push("");
    lines.push("⚠️ Wysoki średni wskaźnik AI sugeruje weryfikację metodologii oceniania.");
  }

  if (ndstCount > 0) {
    lines.push("");
    lines.push(`ℹ️ ${ndstCount} prac uzyskało ocenę niedostateczną — rozważ indywidualną konsultację ze studentami.`);
  }

  lines.push("");
  lines.push("---");
  lines.push("*Raport wygenerowany automatycznie przez AI Sales OS. Oceny mają charakter pomocniczy i wymagają weryfikacji przez promotora/komisję.*");

  return lines.join("\n");
}
