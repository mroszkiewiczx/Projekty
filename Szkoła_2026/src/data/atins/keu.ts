// ============================================================
// src/data/atins/keu.ts
// Kierunkowe Efekty Uczenia się (KEU) dla JSM Psychologia z AI
// Standard: PRK7 / EQF 7 (Master)
// Źródło: D_KEU.md z ATINS Psychologia w Biznesie + adaptacja
// ============================================================

export type Kategoria = "W" | "U" | "K"; // Wiedza / Umiejętności / Kompetencje społeczne
export type KodPRK7 =
  | "P7S_WG"   // Wiedza ogólna
  | "P7S_WK"   // Wiedza kierunkowa
  | "P7S_UW"   // Umiejętności w zastosowaniu wiedzy
  | "P7S_UK"   // Umiejętności komunikacyjne
  | "P7S_UU"   // Uczenie się przez całe życie
  | "P7S_KK"   // Krytyczna ocena
  | "P7S_KO"   // Odpowiedzialność
  | "P7S_KR";  // Rola zawodowa

export interface KEU {
  kod: string;       // np. "K_W01"
  kategoria: Kategoria;
  numer: number;
  opis: string;
  kodyPRK7: KodPRK7[];
}

// ── 16 efektów Wiedzy (K_W01 - K_W16) ─────────────────────

export const KEU_WIEDZA: KEU[] = [
  { kod: "K_W01", kategoria: "W", numer: 1, opis: "Krytycznie analizuje teorie i koncepcje psychologii ogólnej, klinicznej i pracy/biznesu, integrując je z aktualnym stanem wiedzy o systemach AI w praktyce psychologicznej.", kodyPRK7: ["P7S_WG", "P7S_WK"] },
  { kod: "K_W02", kategoria: "W", numer: 2, opis: "Syntetyzuje wiedzę z zakresu neuropsychologii, psychofizjologii oraz biologicznych mechanizmów zachowania w kontekście ich znaczenia dla diagnozy i interwencji wspomaganych technologią.", kodyPRK7: ["P7S_WG"] },
  { kod: "K_W03", kategoria: "W", numer: 3, opis: "Krytycznie ocenia metody i narzędzia diagnostyki psychologicznej, uwzględniając walidację, ograniczenia i ryzyka stosowania narzędzi diagnostycznych wspomaganych AI.", kodyPRK7: ["P7S_WG", "P7S_WK"] },
  { kod: "K_W04", kategoria: "W", numer: 4, opis: "Integruje wiedzę o psychopatologii, klasyfikacjach (ICD-11, DSM-5-TR) i procesach zdrowienia z możliwościami systemów AI wspomagających wczesne wykrywanie zaburzeń.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W05", kategoria: "W", numer: 5, opis: "Krytycznie analizuje modele psychologii organizacji, zarządzania zasobami ludzkimi i przywództwa w kontekście wpływu AI na procesy HR, rekrutację i ocenę kompetencji.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W06", kategoria: "W", numer: 6, opis: "Syntetyzuje wiedzę o metodologii badań psychologicznych (jakościowych, ilościowych, mieszanych), statystyce wielowymiarowej oraz machine learning stosowanych do analizy danych psychologicznych.", kodyPRK7: ["P7S_WG"] },
  { kod: "K_W07", kategoria: "W", numer: 7, opis: "Krytycznie ocenia paradygmaty terapeutyczne (poznawczo-behawioralny, psychodynamiczny, systemowy, humanistyczny) oraz ich integrację z narzędziami cyfrowymi i AI.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W08", kategoria: "W", numer: 8, opis: "Integruje wiedzę o etyce zawodu psychologa oraz etyce AI (fairness, accountability, transparency) w kontekście praktyki psychologicznej i zarządzania zasobami ludzkimi.", kodyPRK7: ["P7S_WG", "P7S_WK"] },
  { kod: "K_W09", kategoria: "W", numer: 9, opis: "Krytycznie analizuje architekturę systemów AI wykorzystywanych w psychologii: modele ML, NLP, generatywne AI, sieci neuronowe oraz ich ograniczenia w obszarze diagnostyki i interwencji.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W10", kategoria: "W", numer: 10, opis: "Syntetyzuje wymogi prawne EU AI Act (Rozporządzenie 2024/1689), w szczególności art. 6, 14 oraz Annex III, w kontekście systemów AI wysokiego ryzyka stosowanych w psychologii.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W11", kategoria: "W", numer: 11, opis: "Krytycznie ocenia regulacje ochrony danych osobowych (RODO, w tym art. 9 i art. 22) w kontekście danych psychologicznych jako danych szczególnych.", kodyPRK7: ["P7S_WG", "P7S_WK"] },
  { kod: "K_W12", kategoria: "W", numer: 12, opis: "Integruje wiedzę o psychologii rozwojowej człowieka w cyklu życia z możliwościami diagnostyki i interwencji wspomaganej AI w różnych grupach wiekowych.", kodyPRK7: ["P7S_WG"] },
  { kod: "K_W13", kategoria: "W", numer: 13, opis: "Krytycznie analizuje procesy poznawcze, emocjonalne i społeczne w kontekście ich modelowania przez systemy AI oraz wpływu na decyzje terapeutyczne i HR.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W14", kategoria: "W", numer: 14, opis: "Syntetyzuje wiedzę o psychologii zdrowia, wellbeing i coachingu z możliwościami narzędzi cyfrowych (Digital Mental Health, e-coaching).", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W15", kategoria: "W", numer: 15, opis: "Krytycznie ocenia prawne i etyczne aspekty orzecznictwa psychologicznego oraz opinii sądowo-psychologicznych z uwzględnieniem ryzyk związanych z AI.", kodyPRK7: ["P7S_WK"] },
  { kod: "K_W16", kategoria: "W", numer: 16, opis: "Integruje wiedzę o przedsiębiorczości, projektowaniu rozwiązań technologicznych oraz audycie systemów AI (FRIA — Fundamental Rights Impact Assessment).", kodyPRK7: ["P7S_WG", "P7S_WK"] },
];

// ── 12 efektów Umiejętności (K_U01 - K_U12) ────────────────

export const KEU_UMIEJETNOSCI: KEU[] = [
  { kod: "K_U01", kategoria: "U", numer: 1, opis: "Krytycznie analizuje i diagnozuje problemy psychologiczne klientów/pacjentów z wykorzystaniem standardowych metod diagnostycznych oraz narzędzi wspomaganych AI, uzasadniając dobór ram teoretycznych.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U02", kategoria: "U", numer: 2, opis: "Projektuje złożone interwencje psychologiczne (terapeutyczne, coachingowe, rozwojowe) z integracją narzędzi cyfrowych i AI, uzasadniając dobór metod do problemu.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U03", kategoria: "U", numer: 3, opis: "Syntetyzuje i interpretuje wyniki badań psychologicznych z wykorzystaniem zaawansowanej statystyki i machine learning, formułując uzasadnione wnioski.", kodyPRK7: ["P7S_UW", "P7S_UU"] },
  { kod: "K_U04", kategoria: "U", numer: 4, opis: "Krytycznie ocenia i komunikuje wyniki diagnozy oraz interwencji psychologicznych, dostosowując komunikację do różnych odbiorców (klient, lekarz, pracodawca, sąd).", kodyPRK7: ["P7S_UK"] },
  { kod: "K_U05", kategoria: "U", numer: 5, opis: "Projektuje złożone badania psychologiczne wykorzystując narzędzia analityczne i AI (Python, R, statystyka, NLP), z uwzględnieniem wymogów RODO.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U06", kategoria: "U", numer: 6, opis: "Krytycznie analizuje narzędzia AI dostępne w psychologii klinicznej i HR (HireVue, Pymetrics, Wysa, Woebot, SAP SuccessFactors), oceniając ich walidację i ograniczenia.", kodyPRK7: ["P7S_UW", "P7S_UU"] },
  { kod: "K_U07", kategoria: "U", numer: 7, opis: "Projektuje i przeprowadza audyty systemów AI stosowanych w psychologii i HR zgodnie z EU AI Act (art. 9, 10, 11, 12, 13, 14) oraz FRIA.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U08", kategoria: "U", numer: 8, opis: "Krytycznie ocenia jakość danych psychologicznych pod kątem bias, fairness oraz przygotowuje dane do analizy z zachowaniem standardów etycznych.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U09", kategoria: "U", numer: 9, opis: "Syntetyzuje wiedzę z literatury naukowej (PubMed, PsycINFO, Scopus), krytycznie oceniając publikacje dotyczące zastosowań AI w psychologii.", kodyPRK7: ["P7S_UU"] },
  { kod: "K_U10", kategoria: "U", numer: 10, opis: "Projektuje złożone strategie wdrożenia narzędzi AI w organizacjach (HR, psychoterapia), uwzględniając aspekty psychologiczne, prawne i organizacyjne.", kodyPRK7: ["P7S_UW"] },
  { kod: "K_U11", kategoria: "U", numer: 11, opis: "Krytycznie ocenia własną praktykę zawodową i uczenie się, identyfikując obszary rozwoju i samodzielnie poszerza wiedzę o nowe technologie.", kodyPRK7: ["P7S_UU"] },
  { kod: "K_U12", kategoria: "U", numer: 12, opis: "Współpracuje w zespołach interdyscyplinarnych (psycholodzy, lekarze, prawnicy, inżynierowie AI), uzasadniając perspektywę psychologiczną.", kodyPRK7: ["P7S_UK"] },
];

// ── 10 efektów Kompetencji społecznych (K_K01 - K_K10) ─────

export const KEU_KOMPETENCJE: KEU[] = [
  { kod: "K_K01", kategoria: "K", numer: 1, opis: "Krytycznie ocenia własne kompetencje zawodowe i etyczne, projektując własny rozwój w obszarze AI w psychologii.", kodyPRK7: ["P7S_KK"] },
  { kod: "K_K02", kategoria: "K", numer: 2, opis: "Aktywnie minimalizuje ryzyka etyczne stosowania AI w psychologii (bias, dyskryminacja, naruszenia prywatności), uzasadniając standardy etyczne PTP i EU AI Act.", kodyPRK7: ["P7S_KK", "P7S_KO"] },
  { kod: "K_K03", kategoria: "K", numer: 3, opis: "Krytycznie ocenia źródła informacji o AI w psychologii, rozróżniając rzetelne publikacje naukowe od materiałów marketingowych.", kodyPRK7: ["P7S_KK"] },
  { kod: "K_K04", kategoria: "K", numer: 4, opis: "Bierze odpowiedzialność za skutki swoich decyzji zawodowych, w tym za rekomendacje wspomagane systemami AI.", kodyPRK7: ["P7S_KO"] },
  { kod: "K_K05", kategoria: "K", numer: 5, opis: "Aktywnie reprezentuje rolę zawodową psychologa wobec klientów, organizacji i sądu, zachowując standardy etyczne PTP.", kodyPRK7: ["P7S_KR"] },
  { kod: "K_K06", kategoria: "K", numer: 6, opis: "Krytycznie ocenia wpływ technologii AI na społeczeństwo, w tym na zdrowie psychiczne i rynek pracy.", kodyPRK7: ["P7S_KK", "P7S_KO"] },
  { kod: "K_K07", kategoria: "K", numer: 7, opis: "Projektuje przedsiębiorcze rozwiązania w obszarze psychologii cyfrowej, oceniając ryzyka prawne i etyczne.", kodyPRK7: ["P7S_KR", "P7S_KO"] },
  { kod: "K_K08", kategoria: "K", numer: 8, opis: "Aktywnie buduje współpracę interdyscyplinarną z inżynierami AI, prawnikami i lekarzami, zachowując autonomię profesji psychologa.", kodyPRK7: ["P7S_KR"] },
  { kod: "K_K09", kategoria: "K", numer: 9, opis: "Krytycznie ocenia własną odpowiedzialność jako profesjonalisty wobec klientów z grup wrażliwych (dzieci, osoby starsze, z niepełnosprawnościami).", kodyPRK7: ["P7S_KO"] },
  { kod: "K_K10", kategoria: "K", numer: 10, opis: "Reprezentuje standardy zawodu psychologa w debacie publicznej o etyce AI, uzasadniając stanowisko opinią ekspercką.", kodyPRK7: ["P7S_KR", "P7S_KK"] },
];

// ── PUBLICZNE API ──────────────────────────────────────────

export const WSZYSTKIE_KEU: KEU[] = [...KEU_WIEDZA, ...KEU_UMIEJETNOSCI, ...KEU_KOMPETENCJE];

export const LICZBA_KEU = {
  W: KEU_WIEDZA.length,
  U: KEU_UMIEJETNOSCI.length,
  K: KEU_KOMPETENCJE.length,
  total: WSZYSTKIE_KEU.length,
} as const;

export function getKEU(kod: string): KEU | undefined {
  return WSZYSTKIE_KEU.find((e) => e.kod === kod);
}

/** Operatory wymagane przez PRK7 (zaawansowane czasowniki w opisie efektów). */
export const PRK7_OPERATORY_WYMAGANE = [
  "krytycznie analizuje",
  "syntetyzuje",
  "integruje",
  "krytycznie ocenia",
  "uzasadnia",
  "projektuje złożone",
  "aktywnie",
  "reprezentuje",
] as const;

/** Operatory PRK6 zabronione w efektach PRK7. */
export const PRK6_OPERATORY_ZABRONIONE = [
  "zna",
  "wymienia",
  "opisuje",
  "definiuje",
  "identyfikuje",
  "rozpoznaje",
  "wskazuje",
  "podaje",
] as const;
