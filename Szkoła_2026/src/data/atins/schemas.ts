// Stub - zostanie wypełniony w Sprint 1
import type { Kierunek } from './moduly'

export type Stopien = 'I' | 'II'

export interface SyllabusFormInput {
  kierunek: Kierunek
  modulKod: string
  kursKod: string
  kursNazwa: string
  ects: number
  godzinyW: number
  godzinyC: number
  semestr: number
  formaZaliczenia: string
  prowadzacy: string
  stopien: Stopien
}
