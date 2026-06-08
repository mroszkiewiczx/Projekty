// ============================================================
// src/data/atins/osf.ts
// Dokumenty OSF (On-line Service Forms) dla wniosku PKA
// Limity znaków zgodne z formularzem OSF dla kierunków JSM
// ============================================================

export type OsfDokId = "c1" | "c2" | "keu" | "plan" | "infra" | "kadra" | "praktyki" | "jakosc";

export interface OsfDokument {
  id: OsfDokId;
  numer: string;
  nazwa: string;
  pelnaNazwa: string;
  opis: string;
  /** Limit znaków OSF. 0 = brak limitu (np. tabele, listy). */
  limitZnakow: number;
  /** Czy to dokument tekstowy (true) czy strukturalny tabela/lista (false). */
  tekstowy: boolean;
  /** Kategorie faktów do wstrzyknięcia w prompt. */
  kategorieFaktow: Array<"rynek" | "prawo" | "psychologia" | "AI" | "praktyki">;
  /** Wytyczne PKA dla tego dokumentu. */
  wytyczne: string[];
}

export const OSF_DOKUMENTY: OsfDokument[] = [
  {
    id: "c1",
    numer: "C1",
    nazwa: "Uzasadnienie rynkowe",
    pelnaNazwa: "C1 Uzasadnienie potrzeby kształcenia",
    opis: "Uzasadnienie potrzeby kształcenia na danym kierunku — analiza rynku pracy, potrzeb społecznych, konkurencji.",
    limitZnakow: 5000,
    tekstowy: true,
    kategorieFaktow: ["rynek", "AI", "psychologia"],
    wytyczne: [
      "Powołaj się na dane z WEF Future of Jobs, ZUS, WHO, ICF",
      "Wskaż lukę na rynku pracy dla psychologów z kompetencjami AI",
      "Porównaj z istniejącymi kierunkami (SWPS, Kozminski, SGH)",
      "Wskaż konkretne ścieżki kariery absolwentów",
    ],
  },
  {
    id: "c2",
    numer: "C2",
    nazwa: "Koncepcja kształcenia",
    pelnaNazwa: "C2 Koncepcja kształcenia i profil absolwenta",
    opis: "Koncepcja kształcenia, sylwetka absolwenta, integracja AI z psychologią w programie.",
    limitZnakow: 4500,
    tekstowy: true,
    kategorieFaktow: ["AI", "psychologia"],
    wytyczne: [
      "Opisz profil absolwenta (kompetencje psychologiczne + AI)",
      "Wskaż 2-4 godziny AI aspect w każdym kursie",
      "Wymień konkretne narzędzia AI (Claude, ChatGPT, HireVue, Pymetrics, SAP SuccessFactors)",
      "Pokaż integrację 90% ECTS psychologii + 8-10% ECTS modułu AI",
    ],
  },
  {
    id: "keu",
    numer: "D",
    nazwa: "KEU — 37 efektów uczenia się",
    pelnaNazwa: "D Kierunkowe efekty uczenia się",
    opis: "Lista 38 KEU: 16 wiedzy (K_W) + 12 umiejętności (K_U) + 10 kompetencji (K_K), zgodne z PRK7.",
    limitZnakow: 0,
    tekstowy: false,
    kategorieFaktow: ["AI", "prawo"],
    wytyczne: [
      "Tylko operatory PRK7: krytycznie analizuje, syntetyzuje, integruje, ocenia",
      "Każdy KEU musi mieć kod PRK7 (P7S_WG, P7S_UW, P7S_KK itp.)",
      "Specyficzne dla AI: K_W09 (ML/NLP), K_W10 (EU AI Act), K_U05 (Python/R), K_U07 (FRIA)",
    ],
  },
  {
    id: "plan",
    numer: "E",
    nazwa: "Plan studiów",
    pelnaNazwa: "E Plan studiów 300 ECTS",
    opis: "Opis planu studiów 300 ECTS, rozkład modułów, semestry 1-10.",
    limitZnakow: 3000,
    tekstowy: true,
    kategorieFaktow: ["psychologia", "AI"],
    wytyczne: [
      "Suma ECTS = 300 (sprawdź arytmetyką)",
      "AI ECTS ≤ 60 (max 20% z 300)",
      "Praktyki: 1000h / 40 ECTS w 4 fazach po 250h",
      "Moduły A (kształcenie ogólne) + B (rdzeń) + C (AI) + D (specjalizacja) + E (praktyki) + F (seminaria)",
    ],
  },
  {
    id: "infra",
    numer: "F",
    nazwa: "Infrastruktura",
    pelnaNazwa: "F Infrastruktura i wyposażenie",
    opis: "Opis bazy dydaktycznej — sale, laboratoria, oprogramowanie, biblioteki.",
    limitZnakow: 3000,
    tekstowy: true,
    kategorieFaktow: [],
    wytyczne: [
      "ATINS: ul. Marcina Lutra 4, Wrocław (~2200 m²)",
      "20 sal dydaktycznych, 640+ miejsc",
      "Sale komputerowe: Python/Anaconda, MATLAB",
      "Placeholdery: dostępność dla niepełnosprawnych, EBSCO/APA/IBUK, R/RStudio (do weryfikacji ATINS)",
    ],
  },
  {
    id: "kadra",
    numer: "G",
    nazwa: "Kadra dydaktyczna",
    pelnaNazwa: "G Kadra dydaktyczna",
    opis: "Lista nauczycieli akademickich z minimum kadrowym (art. 68 PSWiN).",
    limitZnakow: 0,
    tekstowy: false,
    kategorieFaktow: ["prawo"],
    wytyczne: [
      "Minimum 4 dr hab./prof. z ATINS jako podstawowym miejscem pracy",
      "Minimum 6 nauczycieli akademickich łącznie",
      "Każdy z udokumentowanymi publikacjami i kompetencjami AI/psychologii",
      "Placeholder: [Lista nauczycieli akademickich — min. 4 dr hab./prof.]",
    ],
  },
  {
    id: "praktyki",
    numer: "H",
    nazwa: "Praktyki zawodowe",
    pelnaNazwa: "H Praktyki zawodowe 1000h/40 ECTS",
    opis: "Program praktyk zawodowych: 1000 godzin, 40 ECTS, podział na 4 fazy.",
    limitZnakow: 3000,
    tekstowy: true,
    kategorieFaktow: ["praktyki"],
    wytyczne: [
      "1000h w 4 fazach po 250h (semestry 4, 6, 8, 9)",
      "Miejsca praktyk: dla kierunku klinicznego — placówki kliniczne; biznesowego — organizacje HR/coaching",
      "Min. 9 porozumień intencyjnych z placówkami/organizacjami (placeholder ATINS)",
      "Każda faza z efektami KEU i formą weryfikacji",
    ],
  },
  {
    id: "jakosc",
    numer: "I",
    nazwa: "System jakości",
    pelnaNazwa: "I Wewnętrzny system zapewnienia jakości",
    opis: "Procedury zapewnienia jakości kształcenia: ankiety, hospitacje, ewaluacja KEU.",
    limitZnakow: 3000,
    tekstowy: true,
    kategorieFaktow: [],
    wytyczne: [
      "Procedury ankiet studenckich (semestralne)",
      "Hospitacje zajęć przez Radę Programową",
      "Cykliczna ewaluacja KEU (co 2 lata)",
      "Doradztwo zawodowe i monitoring losów absolwentów",
    ],
  },
];

// ── PUBLICZNE API ──────────────────────────────────────────

export function getOsfDokument(id: OsfDokId): OsfDokument | undefined {
  return OSF_DOKUMENTY.find((d) => d.id === id);
}

export function getOsfDokumentyTekstowe(): OsfDokument[] {
  return OSF_DOKUMENTY.filter((d) => d.tekstowy);
}
