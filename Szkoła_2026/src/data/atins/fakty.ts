// ============================================================
// src/data/atins/fakty.ts
// Fakty zweryfikowane do użycia w dokumentach PKA
// Źródło: FAKTY_ZWERYFIKOWANE.md z C:\Visual Studio Code\ATINS_2026_\_skrypty\
//
// ZASADA: Tylko fakty z poziomem pewności WYSOKA lub SREDNIA
//         mogą być automatycznie wstrzykiwane do promptów.
//         Fakty z pewnością NISKA wymagają weryfikacji ATINS.
// ============================================================

export type Pewnosc = "WYSOKA" | "SREDNIA" | "NISKA";

export interface Fakt {
  id: string;
  kategoria: "rynek" | "prawo" | "psychologia" | "AI" | "praktyki";
  tresc: string;
  zrodlo: string;
  rok: number;
  pewnosc: Pewnosc;
  uwagi?: string;
}

// ── Fakty zweryfikowane (WYSOKA/SREDNIA pewność) ──────────

export const FAKTY: Fakt[] = [
  // Rynek pracy i zdrowie psychiczne
  { id: "wef-jobs-2025", kategoria: "rynek",
    tresc: "WEF Future of Jobs Report 2025 prognozuje powstanie 170 mln nowych miejsc pracy oraz likwidację 92 mln (netto +78 mln) do 2030.",
    zrodlo: "WEF Future of Jobs Report 2025", rok: 2025, pewnosc: "WYSOKA" },
  { id: "zus-dni-chorobowe", kategoria: "rynek",
    tresc: "ZUS odnotował w 2024 r. 30,3 mln dni chorobowych z powodów zdrowia psychicznego w Polsce.",
    zrodlo: "ZUS — Absencja chorobowa ubezpieczonych", rok: 2024, pewnosc: "WYSOKA" },
  { id: "who-covid", kategoria: "rynek",
    tresc: "WHO wskazuje na +25% wzrost zaburzeń depresyjnych i lękowych globalnie w wyniku pandemii COVID-19.",
    zrodlo: "WHO World Mental Health Report 2022", rok: 2022, pewnosc: "WYSOKA" },
  { id: "ecnp-koszt-ue", kategoria: "rynek",
    tresc: "Koszt zaburzeń psychicznych dla gospodarki UE szacowany na ok. 600 mld EUR rocznie (koszty bezpośrednie + utracona produktywność).",
    zrodlo: "ECNP / Europejski Instytut Mózgu", rok: 2023, pewnosc: "SREDNIA" },
  { id: "digital-mental-health-rynek", kategoria: "rynek",
    tresc: "Globalny rynek Digital Mental Health: ok. 5-6 mld USD (2023), prognoza ok. 17-25 mld USD (2030), CAGR 20-24% rocznie.",
    zrodlo: "Grand View Research, Mordor Intelligence", rok: 2023, pewnosc: "SREDNIA" },
  { id: "icf-coaching-rynek", kategoria: "rynek",
    tresc: "ICF Global Coaching Study: rynek coachingu globalnie 6,25 mld USD (2022/2023), dynamiczny wzrost względem 2,85 mld USD (2020).",
    zrodlo: "ICF Global Coaching Study 2023", rok: 2023, pewnosc: "WYSOKA" },

  // Prawo
  { id: "eu-ai-act-art6", kategoria: "prawo",
    tresc: "EU AI Act (Rozporządzenie 2024/1689) art. 6 — definicja systemów AI wysokiego ryzyka wymienionych w Annex III.",
    zrodlo: "Dz.Urz. UE L 2024/1689", rok: 2024, pewnosc: "WYSOKA" },
  { id: "eu-ai-act-art14", kategoria: "prawo",
    tresc: "EU AI Act art. 14 — wymóg human oversight (nadzoru ludzkiego) dla systemów AI wysokiego ryzyka.",
    zrodlo: "Dz.Urz. UE L 2024/1689", rok: 2024, pewnosc: "WYSOKA" },
  { id: "eu-ai-act-annex-hr", kategoria: "prawo",
    tresc: "EU AI Act Annex III pkt 4 — systemy AI stosowane w zatrudnianiu, doborze pracowników i zarządzaniu nimi = wysokie ryzyko.",
    zrodlo: "Dz.Urz. UE L 2024/1689, Annex III", rok: 2024, pewnosc: "WYSOKA" },
  { id: "rodo-art22", kategoria: "prawo",
    tresc: "RODO art. 22 — prawo do tego, by nie podlegać decyzji opartej wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu.",
    zrodlo: "Rozporządzenie UE 2016/679 (RODO)", rok: 2018, pewnosc: "WYSOKA" },
  { id: "rodo-art9", kategoria: "prawo",
    tresc: "RODO art. 9 — dane psychologiczne kwalifikują się jako dane szczególnej kategorii wymagające wzmocnionej ochrony.",
    zrodlo: "Rozporządzenie UE 2016/679 (RODO)", rok: 2018, pewnosc: "WYSOKA" },
  { id: "nyc-aedt", kategoria: "prawo",
    tresc: "NYC Local Law 144 (AEDT) — od 5 lipca 2023 pracodawcy w Nowym Jorku muszą przeprowadzać audyty bezstronności narzędzi AI w rekrutacji. Pierwsza taka regulacja miejska na świecie.",
    zrodlo: "NYC Local Law 144", rok: 2023, pewnosc: "WYSOKA" },
  { id: "pswin-jsm", kategoria: "prawo",
    tresc: "Ustawa z 20 lipca 2018 r. Prawo o Szkolnictwie Wyższym i Nauce (Dz.U. 2018 poz. 1668 z późn. zm.) — podstawa prawna kierunków JSM, w tym art. 65 (poziom PRK), art. 68 (minimum kadrowe).",
    zrodlo: "Dz.U. 2018 poz. 1668", rok: 2018, pewnosc: "WYSOKA" },
  { id: "pswin-art68", kategoria: "prawo",
    tresc: "PSWiN art. 68 — minimum kadrowe dla kierunku JSM: min. 6 nauczycieli akademickich, z czego min. 4 ze stopniem dr hab. lub tytułem profesora, zatrudnieni w uczelni jako podstawowym miejscu pracy.",
    zrodlo: "Dz.U. 2018 poz. 1668, art. 68", rok: 2018, pewnosc: "WYSOKA" },
  { id: "ustawa-psycholog-2001", kategoria: "prawo",
    tresc: "Ustawa z 8 czerwca 2001 r. o zawodzie psychologa i samorządzie zawodowym psychologów (Dz.U. 2001 nr 73 poz. 763) — formalne ramy zawodu psychologa w PL.",
    zrodlo: "Dz.U. 2001 nr 73 poz. 763", rok: 2001, pewnosc: "WYSOKA",
    uwagi: "Kluczowe przepisy o rejestrze i izbach nigdy nie zostały w pełni wdrożone." },

  // Psychologia i AI
  { id: "amazon-recruiting-bias", kategoria: "AI",
    tresc: "Reuters 2018: Amazon porzucił narzędzie AI do rekrutacji po wykryciu systematycznej dyskryminacji kobiet (system nauczył się na historycznych danych zdominowanych przez mężczyzn).",
    zrodlo: "Reuters", rok: 2018, pewnosc: "WYSOKA" },
  { id: "ai-w-hr-skala", kategoria: "AI",
    tresc: "Ponad połowa dużych organizacji wdrożyła AI w procesach HR (rekrutacja, selekcja, ocena wydajności).",
    zrodlo: "McKinsey State of AI 2024", rok: 2024, pewnosc: "SREDNIA" },
  { id: "linkedin-talent-trends", kategoria: "AI",
    tresc: "LinkedIn odnotowuje szybki wzrost liczby ofert pracy HR wymagających kompetencji AI.",
    zrodlo: "LinkedIn Talent Trends 2024", rok: 2024, pewnosc: "SREDNIA" },
  { id: "limbic-medical-device", kategoria: "AI",
    tresc: "Limbic (UK) — pierwszy szeroko rozpoznawany chatbot terapeutyczny z certyfikatem CE jako wyrób medyczny klasy IIa (UK MHRA). Przykład realnej regulacji AI w zdrowiu psychicznym.",
    zrodlo: "UK MHRA", rok: 2023, pewnosc: "SREDNIA" },
];

// ── Fakty ZABRONIONE (do listy negatywnej w promptach) ────

/** Fakty/sformułowania których AI NIE może użyć — są nieprawdziwe lub nieweryfikowalne. */
export const FAKTY_ZABRONIONE = [
  {
    fraza: "73% Fortune 500",
    powod: "Dokładna cyfra nieweryfikowalna. Użyj: 'ponad połowa dużych organizacji'.",
  },
  {
    fraza: "Dz.U. 2026 poz. 187",
    powod: "Sygnatura nieweryfikowalna w ISAP. Jeśli odnosisz się do nowej ustawy o zawodzie psychologa, użyj: 'projekt ustawy o zawodzie psychologa (stan legislacyjny do weryfikacji w ISAP)'.",
  },
  {
    fraza: "FDA clearance Woebot",
    powod: "Woebot funkcjonuje jako aplikacja wellness, nie medical device. Brak FDA clearance.",
  },
  {
    fraza: "FDA clearance Wysa",
    powod: "Wysa funkcjonuje jako aplikacja wellness, nie medical device. Brak FDA clearance.",
  },
  {
    fraza: "FDA-cleared chatbot",
    powod: "Żaden powszechnie znany chatbot terapeutyczny nie posiada FDA clearance jako medical device.",
  },
  {
    fraza: "Annex III pkt 3",
    powod: "Numeracja z projektu, nie finalnego tekstu. W EU AI Act 2024/1689 systemy AI w HR są w Annex III pkt 4.",
  },
] as const;

// ── Placeholdery wymagające danych od ATINS ────────────────

/** Placeholdery które AI musi zostawić w tekście — NIE wolno ich wymyślać. */
export const PLACEHOLDERY_ATINS = [
  "[NIP ATINS]",
  "[REGON ATINS]",
  "[Adres siedziby ATINS]",
  "[Rektor ATINS — imię i nazwisko]",
  "[Numer decyzji o wpisie do rejestru uczelni niepublicznych]",
  "[Imię i nazwisko Kierownika Kierunku]",
  "[Lista nauczycieli akademickich — min. 4 dr hab./prof.]",
  "[Lista umów z podmiotami praktyk — min. 9 porozumień]",
  "[Imię i nazwisko Inspektora Ochrony Danych]",
  "[Numer Uchwały Senatu i data]",
  "[Numer Zarządzenia Rektora i data]",
] as const;

// ── PUBLICZNE API ──────────────────────────────────────────

export function getFaktyByKategoria(kategoria: Fakt["kategoria"]): Fakt[] {
  return FAKTY.filter((f) => f.kategoria === kategoria);
}

export function getFaktyWysokaPewnosc(): Fakt[] {
  return FAKTY.filter((f) => f.pewnosc === "WYSOKA");
}

/** Buduje sekcję promptu z zweryfikowanymi faktami dla konkretnego kontekstu. */
export function buildFactsSection(kategorie: Fakt["kategoria"][]): string {
  const fakty = FAKTY.filter((f) => kategorie.includes(f.kategoria));
  if (fakty.length === 0) return "";

  const lines = fakty.map(
    (f) => `- ${f.tresc} (${f.zrodlo}, ${f.rok})`
  );
  return `## ZWERYFIKOWANE FAKTY (używaj tylko tych):\n${lines.join("\n")}`;
}

/** Buduje sekcję promptu z listą zabronionych fraz. */
export function buildForbiddenFactsSection(): string {
  const lines = FAKTY_ZABRONIONE.map(
    (z) => `- NIE UŻYWAJ: "${z.fraza}" — ${z.powod}`
  );
  return `## ZAKAZY (te frazy/dane są nieprawdziwe lub nieweryfikowalne):\n${lines.join("\n")}`;
}

/** Buduje sekcję promptu z listą placeholderów do zachowania. */
export function buildPlaceholdersSection(): string {
  const lines = PLACEHOLDERY_ATINS.map((p) => `- ${p}`);
  return `## PLACEHOLDERY (zostaw w tekście, NIE wymyślaj danych ATINS):\n${lines.join("\n")}`;
}
