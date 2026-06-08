// ============================================================
// src/services/atinsDocxExporter.ts
// Eksport markdown → DOCX w stylu ATINS PKA 2026
//
// Standard formatowania (z docx_base.py ATINS_2026_):
//   - Czcionka: Arial
//   - H1: 14pt bold, kolor #1A5276
//   - H2: 12pt bold, kolor #1A5276
//   - H3: 11pt bold, kolor #1A5276
//   - Body: 11pt justify
//   - Tabele: nagłówki #1A5276 białym tekstem 10pt bold
//   - Marginesy: 2.5/2.0/2.5/2.0 cm
//   - Stopka: "ATINS - [kierunek] - [dokument] - Wersja 1.0 - YYYY-MM-DD"
// ============================================================

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, Footer, ShadingType,
} from "docx";
import { saveAs } from "file-saver";

const FONT = "Arial";
const COLOR_HEADER = "1A5276";
const COLOR_BLACK = "000000";
const COLOR_GRAY = "666666";

// ── Parsing markdown → docx Paragraph[] ────────────────────

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "table"; headers: string[]; rows: string[][] };

/** Parsuje pojedynczy wiersz tabeli markdown.
 *  Obsługuje "| a | b | c |" oraz "| a | b | c" (bez trailing pipe).
 *  Zachowuje puste komórki wewnątrz. Nie usuwa danych. */
function parseTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function parseMarkdownToBlocks(md: string): Block[] {
  const lines = md.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Nagłówki
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // Tabela markdown
    if (trimmed.startsWith("|") && lines[i + 1]?.trim().startsWith("|") && lines[i + 1].includes("---")) {
      const headerCells = parseTableRow(trimmed);
      i += 2; // pomijamy nagłówek + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = parseTableRow(lines[i].trim());
        if (cells.length > 0) {
          // Wyrównaj liczbę kolumn do nagłówka (uzupełnij brakujące pustymi stringami)
          while (cells.length < headerCells.length) cells.push("");
          // Nie odrzucaj nadmiarowych kolumn — zachowujemy dane
          rows.push(cells);
        }
        i++;
      }
      blocks.push({ type: "table", headers: headerCells, rows });
      continue;
    }

    // Listy
    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) break;
        if (/^[-*]\s+/.test(l)) {
          items.push(l.replace(/^[-*]\s+/, ""));
        } else if (/^\d+\.\s+/.test(l)) {
          items.push(l.replace(/^\d+\.\s+/, ""));
        } else {
          break;
        }
        i++;
      }
      blocks.push({ type: "list", items, ordered });
      continue;
    }

    // Zwykły paragraf — łącz kolejne nie-puste linie
    const paraLines: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || l.startsWith("#") || l.startsWith("|") || /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)) break;
      paraLines.push(l);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

// ── Helpery do TextRun z inline formatowaniem ─────────────

/** Tłumaczy inline markdown **bold** *italic* `code` na TextRun[]. */
function parseInlineRuns(text: string, baseSize: number, baseBold: boolean, color: string): TextRun[] {
  const runs: TextRun[] = [];
  // Regex łapie **bold** i *italic* i `code`
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push(new TextRun({ text: text.slice(lastIdx, match.index), font: FONT, size: baseSize, bold: baseBold, color }));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      runs.push(new TextRun({ text: token.slice(2, -2), font: FONT, size: baseSize, bold: true, color }));
    } else if (token.startsWith("`")) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: "Consolas", size: baseSize, bold: baseBold, color }));
    } else if (token.startsWith("*")) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: FONT, size: baseSize, bold: baseBold, italics: true, color }));
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIdx), font: FONT, size: baseSize, bold: baseBold, color }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text, font: FONT, size: baseSize, bold: baseBold, color }));
  }
  return runs;
}

// ── Konwersja Block → docx ─────────────────────────────────

// docx używa half-points: 22 = 11pt, 24 = 12pt, 28 = 14pt, 20 = 10pt
const SIZE_H1 = 28;
const SIZE_H2 = 24;
const SIZE_H3 = 22;
const SIZE_BODY = 22;
const SIZE_TABLE = 20;
const SIZE_FOOTER = 18;

function blockToDocxChildren(block: Block): (Paragraph | Table)[] {
  switch (block.type) {
    case "h1":
      return [new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: parseInlineRuns(block.text, SIZE_H1, true, COLOR_HEADER),
      })];
    case "h2":
      return [new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: parseInlineRuns(block.text, SIZE_H2, true, COLOR_HEADER),
      })];
    case "h3":
      return [new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 },
        children: parseInlineRuns(block.text, SIZE_H3, true, COLOR_HEADER),
      })];
    case "paragraph":
      return [new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        children: parseInlineRuns(block.text, SIZE_BODY, false, COLOR_BLACK),
      })];
    case "list":
      return block.items.map((item, idx) => new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: block.ordered ? `${idx + 1}. ` : "• ",
            font: FONT,
            size: SIZE_BODY,
            bold: false,
          }),
          ...parseInlineRuns(item, SIZE_BODY, false, COLOR_BLACK),
        ],
        indent: { left: 360 },
      }));
    case "table":
      return [buildTable(block.headers, block.rows)];
  }
}

function buildTable(headers: string[], rows: string[][]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: COLOR_HEADER, color: "auto" },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: FONT, size: SIZE_TABLE, bold: true, color: "FFFFFF" })],
      })],
    })),
  });

  const dataRows = rows.map((row) => new TableRow({
    children: row.map((cell) => new TableCell({
      children: [new Paragraph({
        children: parseInlineRuns(cell, SIZE_TABLE, false, COLOR_BLACK),
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
    },
  });
}

// ── Footer ──────────────────────────────────────────────────

function buildFooter(kierunek: string, dokument: string): Footer {
  const today = new Date().toISOString().slice(0, 10);
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: `ATINS - ${kierunek} - ${dokument} - Wersja 1.0 - ${today}`,
        font: FONT,
        size: SIZE_FOOTER,
        color: COLOR_GRAY,
      })],
    })],
  });
}

// ── Konfiguracja marginesów ATINS ──────────────────────────

// docx używa twips: 1 cm = 567 twips
const MARGIN_TOP_BOTTOM = 1417; // 2.5 cm
const MARGIN_LEFT_RIGHT = 1134; // 2.0 cm

function buildDocument(markdown: string, kierunek: string, dokument: string): Document {
  const blocks = parseMarkdownToBlocks(markdown);
  const children = blocks.flatMap(blockToDocxChildren);

  return new Document({
    creator: "AI Sales OS — ATINS PKA Module",
    title: `${kierunek} - ${dokument}`,
    description: `Dokument PKA wygenerowany dla kierunku ${kierunek}`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: MARGIN_TOP_BOTTOM,
            right: MARGIN_LEFT_RIGHT,
            bottom: MARGIN_TOP_BOTTOM,
            left: MARGIN_LEFT_RIGHT,
          },
        },
      },
      footers: { default: buildFooter(kierunek, dokument) },
      children,
    }],
  });
}

// ── PUBLICZNE API ──────────────────────────────────────────

interface ExportSyllabusOptions {
  markdownContent: string;
  kierunekNazwa: string;
  kursKod: string;
  kursNazwa: string;
}

/** Eksportuje syllabus do .docx. Nazwa pliku: SYL_<kursKod>_<kursNazwa>.docx */
export async function exportSyllabusToDocx(opts: ExportSyllabusOptions): Promise<void> {
  const safeKurs = opts.kursNazwa.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  const fileName = `SYL_${opts.kursKod}_${safeKurs}.docx`;
  const blob = await exportSyllabusToDocxBlob(opts);
  saveAs(blob, fileName);
}

/** Buduje syllabus jako Blob bez zapisywania pliku (do batch ZIP). */
export async function exportSyllabusToDocxBlob(opts: ExportSyllabusOptions): Promise<Blob> {
  const doc = buildDocument(
    opts.markdownContent,
    opts.kierunekNazwa,
    `Syllabus ${opts.kursKod} ${opts.kursNazwa}`
  );
  return Packer.toBlob(doc);
}

interface ExportPlainOptions {
  markdownContent: string;
  kierunekNazwa: string;
  dokumentNazwa: string;
}

/** Eksportuje dowolny markdown (OSF, KEU, plan studiów itp.) do .docx ATINS. */
export async function exportPlainToDocx(opts: ExportPlainOptions): Promise<void> {
  const safeDok = opts.dokumentNazwa.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  const fileName = `${safeDok}.docx`;
  const doc = buildDocument(opts.markdownContent, opts.kierunekNazwa, opts.dokumentNazwa);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

// ── Eksport raportu oceny ──────────────────────────────────

export interface EvaluationReportData {
  ogolna: number;
  merytorycznosc: number;
  kompletnosc: number;
  fokus: number;
  glebokosc: number;
  zgodnoscPka: number;
  mocne: string[];
  uwagi: string[];
  poprawki: string[];
}

interface ExportEvalOptions {
  evalResult: EvaluationReportData;
  typDokumentu: string;
  evaluatedContentPreview: string;
}

/** Mapuje ocenę 0-100 na kolor zgodny ze standardem ATINS (zielony/amber/czerwony). */
function scoreColorHex(value: number): string {
  if (value >= 80) return "16A34A"; // green-600
  if (value >= 60) return "D97706"; // amber-600
  return "DC2626"; // red-600
}

/** Buduje tytuł z gwiazdkami dla oceny ogólnej. */
function scoreStars(value: number): string {
  if (value >= 90) return "★★★★★";
  if (value >= 80) return "★★★★☆";
  if (value >= 70) return "★★★☆☆";
  if (value >= 60) return "★★☆☆☆";
  if (value >= 40) return "★☆☆☆☆";
  return "☆☆☆☆☆";
}

/** Buduje wiersz tabeli oceny z paskiem koloru w komórce wyniku. */
function buildScoreRow(label: string, value: number): TableRow {
  const color = scoreColorHex(value);
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 60, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({ text: label, font: FONT, size: SIZE_TABLE, color: COLOR_BLACK })],
        })],
      }),
      new TableCell({
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: color, color: "auto" },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `${value}/100`, font: FONT, size: SIZE_TABLE, bold: true, color: "FFFFFF" })],
        })],
      }),
    ],
  });
}

/** Buduje sekcję z listą (Mocne strony / Uwagi / Poprawki). */
function buildListSection(title: string, items: string[], titleColor: string, numbered: boolean): (Paragraph | Table)[] {
  const blocks: (Paragraph | Table)[] = [];
  if (items.length === 0) return blocks;

  blocks.push(new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: `${title} (${items.length})`, font: FONT, size: SIZE_H3, bold: true, color: titleColor })],
  }));

  items.forEach((item, idx) => {
    blocks.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 360 },
      children: [
        new TextRun({
          text: numbered ? `${idx + 1}. ` : "• ",
          font: FONT,
          size: SIZE_BODY,
          bold: true,
          color: titleColor,
        }),
        new TextRun({ text: item, font: FONT, size: SIZE_BODY, color: COLOR_BLACK }),
      ],
    }));
  });

  return blocks;
}

/** Eksportuje raport oceny PKA do .docx w formacie ATINS. */
export async function exportEvaluationReportToDocx(opts: ExportEvalOptions): Promise<void> {
  const e = opts.evalResult;
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Raport_oceny_${opts.typDokumentu}_${dateStr}.docx`;

  // Mapuj typ dokumentu na czytelną nazwę
  const typReadable: Record<string, string> = {
    "syllabus": "Syllabus (10 sekcji)",
    "osf-c1": "OSF C1 — Uzasadnienie rynkowe",
    "osf-c2": "OSF C2 — Koncepcja kształcenia",
    "keu": "KEU — Efekty uczenia się",
    "plan-studiow": "Plan studiów",
    "inny": "Inny dokument PKA",
  };
  const typLabel = typReadable[opts.typDokumentu] ?? opts.typDokumentu;

  const children: (Paragraph | Table)[] = [];

  // Tytuł
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: "RAPORT OCENY PKA", font: FONT, size: 36, bold: true, color: COLOR_HEADER })],
  }));

  // Metadane
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "Data oceny: ", font: FONT, size: SIZE_BODY, bold: true, color: COLOR_HEADER }),
      new TextRun({ text: dateStr, font: FONT, size: SIZE_BODY, color: COLOR_BLACK }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "Typ dokumentu: ", font: FONT, size: SIZE_BODY, bold: true, color: COLOR_HEADER }),
      new TextRun({ text: typLabel, font: FONT, size: SIZE_BODY, color: COLOR_BLACK }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { after: 240 },
    children: [
      new TextRun({ text: "Fragment ocenianego dokumentu: ", font: FONT, size: SIZE_BODY, bold: true, color: COLOR_HEADER }),
      new TextRun({
        text: opts.evaluatedContentPreview.length > 400
          ? opts.evaluatedContentPreview.slice(0, 400) + "..."
          : opts.evaluatedContentPreview,
        font: FONT,
        size: 20,
        italics: true,
        color: COLOR_GRAY,
      }),
    ],
  }));

  // Ocena ogólna — duży nagłówek
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text: `OCENA OGÓLNA: ${e.ogolna}/100`,
        font: FONT,
        size: 32,
        bold: true,
        color: scoreColorHex(e.ogolna),
      }),
    ],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: scoreStars(e.ogolna), font: FONT, size: 28, color: scoreColorHex(e.ogolna) }),
    ],
  }));

  // Tabela wymiarów
  children.push(new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "WYMIARY OCENY", font: FONT, size: SIZE_H2, bold: true, color: COLOR_HEADER })],
  }));

  const scoreTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLOR_HEADER, color: "auto" },
            children: [new Paragraph({
              children: [new TextRun({ text: "Wymiar oceny", font: FONT, size: SIZE_TABLE, bold: true, color: "FFFFFF" })],
            })],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLOR_HEADER, color: "auto" },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Wynik", font: FONT, size: SIZE_TABLE, bold: true, color: "FFFFFF" })],
            })],
          }),
        ],
      }),
      buildScoreRow("1. Merytoryczność", e.merytorycznosc),
      buildScoreRow("2. Kompletność wątków", e.kompletnosc),
      buildScoreRow("3. Fokus", e.fokus),
      buildScoreRow("4. Głębokość PRK7", e.glebokosc),
      buildScoreRow("5. Zgodność PKA", e.zgodnoscPka),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
    },
  });
  children.push(scoreTable);
  children.push(new Paragraph({ children: [] })); // odstęp po tabeli

  // 3 sekcje list
  children.push(...buildListSection("MOCNE STRONY", e.mocne, "16A34A", false));
  children.push(...buildListSection("UWAGI", e.uwagi, "D97706", false));
  children.push(...buildListSection("WYMAGANE POPRAWKI", e.poprawki, "DC2626", true));

  const doc = new Document({
    creator: "AI Sales OS — ATINS PKA Module",
    title: `Raport oceny ${typLabel}`,
    description: `Raport oceny PKA dla dokumentu typu ${typLabel}`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: MARGIN_TOP_BOTTOM,
            right: MARGIN_LEFT_RIGHT,
            bottom: MARGIN_TOP_BOTTOM,
            left: MARGIN_LEFT_RIGHT,
          },
        },
      },
      footers: { default: buildFooter("Raport oceny", typLabel) },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
