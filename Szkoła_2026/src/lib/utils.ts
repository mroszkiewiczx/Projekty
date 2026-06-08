// ============================================================
// src/lib/utils.ts
// Shared utilities: cn(), formatPLN(), formatDate()
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merge helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format liczby jako PLN */
export function formatPLN(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Format daty (pl-PL) */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/** Format daty i czasu */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Skróć tekst do N znaków */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Inicjały z imienia i nazwiska */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/** Walidacja email */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/** Walidacja hasła (min 8 znaków) */
export function isValidPassword(password: string): boolean {
  return password && password.length >= 8;
}

/** Walidacja nazwy szkoły (min 3 znaki) */
export function isValidSchoolName(name: string): boolean {
  return name && name.length >= 3;
}

/** Sprawdź czy role jest admin */
export function isAdmin(role: string | null | undefined): boolean {
  return role === 'school_admin' || role === 'super_admin';
}

/** Sprawdź czy role jest teacher */
export function isTeacher(role: string | null | undefined): boolean {
  return role === 'teacher';
}

/** Format quality score (0-100) */
export function formatQualityScore(score: number | null | undefined): string {
  if (!score) return 'N/A';
  return `${Math.round(score)}/100`;
}

/** Get status badge color */
export function getStatusColor(status: 'draft' | 'published' | 'archived' | string): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
