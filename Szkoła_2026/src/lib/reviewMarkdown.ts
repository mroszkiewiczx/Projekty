// src/lib/reviewMarkdown.ts
// Generuje plik Markdown z recenzją pracy dyplomowej na podstawie ReviewResult

import type { ThesisEntry, ReviewResult } from "@/types/thesis";

function formatDate(): string {
  return new Date().toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateReviewMarkdown(entry: ThesisEntry): string {
  const r = entry.result as ReviewResult;

  const lines: string[] = [];

  // ── Nagłówek ──────────────────────────────────────────────────────────────
  lines.push("# Recenzja Pracy Dyplomowej");
  lines.push("");
  lines.push(`> Wygenerowano automatycznie przez AI Sales OS — ${formatDate()}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 1. Dane studenta ──────────────────────────────────────────────────────
  lines.push("## 1. Dane Identyfikacyjne Studenta");
  lines.push("");
  lines.push("| Pole | Wartość |");
  lines.push("|------|---------|");
  lines.push(`| Imię i nazwisko | ${r.student?.name ?? "—"} |`);
  lines.push(`| Nr albumu | ${r.student?.albumNumber ?? "—"} |`);
  lines.push(`| Kierunek | ${r.student?.major ?? "—"} |`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 2. Temat pracy ────────────────────────────────────────────────────────
  lines.push("## 2. Temat Pracy");
  lines.push("");
  lines.push(`- **Temat zadeklarowany:** ${r.thesisTopic ?? entry.title ?? "—"}`);
  lines.push(`- **Temat faktyczny:** ${r.actualTopic ?? "—"}`);
  if (r.topicMismatch) {
    lines.push("");
    lines.push("⚠️ **Uwaga:** Temat deklarowany różni się od faktycznej treści pracy.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 3. Streszczenie ───────────────────────────────────────────────────────
  lines.push("## 3. Streszczenie Pracy");
  lines.push("");
  lines.push(r.abstractAI ?? r.summary ?? "Brak streszczenia.");
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 4. Analiza treści ─────────────────────────────────────────────────────
  lines.push("## 4. Analiza Treści");
  lines.push("");
  const ca = r.contentAnalysis;
  if (ca) {
    lines.push(`- **Na temat:** ${ca.onTopic ? "Tak" : "Nie"}`);
    lines.push(`- **Treść merytoryczna:** ${ca.substantivePercent}%`);
    lines.push(`- **„Lanie wody":** ${ca.waterPercent}%`);
    if (ca.comment) {
      lines.push("");
      lines.push(ca.comment);
    }
  } else {
    lines.push("Brak danych analizy treści.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 5. Poziom wiedzy ──────────────────────────────────────────────────────
  lines.push("## 5. Poziom Wiedzy Studenta");
  lines.push("");
  lines.push(`**Ocena: ${r.knowledgeLevel ?? "—"}/100**`);
  lines.push("");
  if (r.knowledgeLevelComment) {
    lines.push(r.knowledgeLevelComment);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 6. Mocne strony ───────────────────────────────────────────────────────
  lines.push("## 6. Mocne Strony Pracy ✓");
  lines.push("");
  if (r.strengths && r.strengths.length > 0) {
    for (const s of r.strengths) {
      lines.push(`- ✓ ${s}`);
    }
  } else {
    lines.push("Brak wskazanych mocnych stron.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 7. Coaching ───────────────────────────────────────────────────────────
  lines.push("## 7. Wskazówki na Przyszłość (Coaching)");
  lines.push("");
  if (r.coaching && r.coaching.length > 0) {
    for (const c of r.coaching) {
      lines.push(`- 💡 ${c}`);
    }
  } else {
    lines.push("Brak wskazówek.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 8. Ocena szczegółowa ──────────────────────────────────────────────────
  lines.push("## 8. Ocena Szczegółowa");
  lines.push("");
  lines.push("| Kryterium | Punkty | Maks. | Komentarz |");
  lines.push("|-----------|--------|-------|-----------|");
  if (r.details && r.details.length > 0) {
    for (const d of r.details) {
      const comment = d.comment.replace(/\|/g, "\\|");
      lines.push(`| ${d.criterion} | ${d.score} | ${d.maxScore} | ${comment} |`);
    }
  }
  lines.push("");
  lines.push(`**Łączna ocena: ${r.score} pkt → ${r.grade}**`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 9. Wykrycie AI ────────────────────────────────────────────────────────
  lines.push("## 9. Wykrycie Treści Generowanych przez AI");
  lines.push("");
  const ai = r.aiDetection;
  if (ai) {
    lines.push(`**Prawdopodobieństwo:** ${ai.probability}%`);
    lines.push("");
    if (ai.signals && ai.signals.length > 0) {
      lines.push("**Sygnały:**");
      for (const s of ai.signals) {
        lines.push(`- ${s}`);
      }
      lines.push("");
    }
    if (ai.explanation) {
      lines.push(`**Wyjaśnienie:** ${ai.explanation}`);
    }
  } else {
    lines.push("Brak danych analizy AI.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 10. Podsumowanie sekcji ───────────────────────────────────────────────
  lines.push("## 10. Podsumowanie Sekcji");
  lines.push("");
  lines.push(r.sectionSummary ?? "Brak podsumowania sekcji.");
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 11. Rekomendacja końcowa ──────────────────────────────────────────────
  lines.push("## 11. Rekomendacja Końcowa");
  lines.push("");
  lines.push(`**${r.recommendation}**`);
  lines.push("");
  lines.push(r.summary);
  lines.push("");
  lines.push("---");
  lines.push("*Recenzja przygotowana przez system AI Sales OS na podstawie dostarczonego tekstu pracy.*");

  return lines.join("\n");
}
