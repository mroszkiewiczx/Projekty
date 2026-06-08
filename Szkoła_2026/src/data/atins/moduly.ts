// Stub - zostanie wypełniony danymi ATINS w Sprint 1

export interface Kurs {
  kod: string
  nazwa: string
  ects: number
  godzinyW: number
  godzinyC: number
  semestr: number
  formaZaliczenia: string
}

export type Kierunek = string

export interface ModulDef {
  kod: string
  nazwa: string
  kursy: Kurs[]
}

export interface KierunekDef {
  id: string
  nazwa: string
  moduly: ModulDef[]
}

export const KIERUNKI_DEFS: KierunekDef[] = []
