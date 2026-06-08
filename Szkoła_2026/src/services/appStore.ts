// ============================================================
// src/services/appStore.ts
// Central persistent store — wszystkie ustawienia w localStorage
// Przeżywa odświeżenia strony, nawigację, zamknięcie zakładki
// ============================================================

import { removeCredential, setCredential } from "./credentialStore";

// ── Types ─────────────────────────────────────────────────────

export type ActualStatus =
  | "ok"
  | "no_key"
  | "invalid_format"
  | "unauthorized"
  | "forbidden"
  | "no_funds"
  | "rate_limited"
  | "timeout"
  | "network_error"
  | "provider_error"
  | "not_tested"
  | "unknown";

export interface Credential {
  apiKey: string;           // pełny klucz — tylko DEV; prod → Supabase encrypted
  keyHint: string;          // ostatnie 4 znaki
  isValid: boolean;
  savedAt: string;
  testedAt: string | null;
  testStatus: "ok" | "error" | "warning" | null;
  testMessage: string | null;
  actualStatus: ActualStatus;
  errorCode: string | null;
  latencyMs: number | null;
  selectedModel: string | null;
  extraConfig: Record<string, string>;
}

export interface IntegrationConfig {
  isConnected: boolean;
  config: Record<string, string | boolean | number | string[]>;
  testedAt: string | null;
  testStatus: "ok" | "error" | "warning" | null;
  testMessage: string | null;
  syncAt: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "sales" | "viewer";
  passwordHash: string;
  avatar: string | null;
  phone: string;
  position: string;
  department: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  permissions: string[];
}

export interface WorkspaceSettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  language: "pl" | "en";
  timezone: string;
  currency: "PLN" | "EUR" | "USD";
  nip: string;
  address: string;
  website: string;
}

export interface AiSettings {
  activeModel: string;
  temperature: number;
  maxTokens: number;
  briefingModel: string;
  transcriptionProvider: "deepgram" | "assemblyai";
  transcriptionLanguage: string;
}

export interface AppStoreData {
  version: number;
  credentials: Record<string, Credential>;
  integrations: Record<string, IntegrationConfig>;
  users: UserProfile[];
  currentUserId: string;
  workspace: WorkspaceSettings;
  aiSettings: AiSettings;
}

// ── Constants ──────────────────────────────────────────────────

const STORE_KEY = "salesos_v1";
const STORE_EVENT = "salesos_store_change";

// ── Password hashing (DEV — not cryptographically secure) ──────

function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) ^ password.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash.toString(36);
}

const LEGACY_ADMIN_ID = "u_admin";
const LEGACY_ADMIN_EMAIL = "admin@salesos.pl";
const LEGACY_ADMIN_HASH = hashPassword("admin123");

function isLegacyDefaultAdmin(user: UserProfile): boolean {
  return user.id === LEGACY_ADMIN_ID &&
    user.email === LEGACY_ADMIN_EMAIL &&
    user.passwordHash === LEGACY_ADMIN_HASH;
}

// ── Default store state ────────────────────────────────────────

function makeDefault(): AppStoreData {
  return {
    version: 1,
    credentials: {},
    integrations: {},
    users: [],
    currentUserId: "",
    workspace: {
      name: "Moje Biuro",
      logoUrl: null,
      primaryColor: "#6366f1",
      language: "pl",
      timezone: "Europe/Warsaw",
      currency: "PLN",
      nip: "",
      address: "",
      website: "",
    },
    aiSettings: {
      activeModel: "google/gemini-2.5-flash-preview-05-20",
      temperature: 0.7,
      maxTokens: 3000,
      briefingModel: "google/gemini-2.5-flash-preview-05-20",
      transcriptionProvider: "deepgram",
      transcriptionLanguage: "pl",
    },
  };
}

// ── Core read / write ──────────────────────────────────────────

function read(): AppStoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return makeDefault();
    const parsed = JSON.parse(raw) as Partial<AppStoreData>;
    // Merge with defaults to handle schema additions
    const def = makeDefault();
    const parsedUsers = parsed.users ?? [];
    const sanitizedUsers = parsedUsers.length === 1 && isLegacyDefaultAdmin(parsedUsers[0])
      ? []
      : parsedUsers;
    const currentUserId = sanitizedUsers.some((u) => u.id === parsed.currentUserId)
      ? parsed.currentUserId ?? def.currentUserId
      : def.currentUserId;

    return {
      ...def,
      ...parsed,
      workspace: { ...def.workspace, ...(parsed.workspace ?? {}) },
      aiSettings: { ...def.aiSettings, ...(parsed.aiSettings ?? {}) },
      credentials: parsed.credentials ?? {},
      integrations: parsed.integrations ?? {},
      users: sanitizedUsers,
      currentUserId,
    };
  } catch {
    return makeDefault();
  }
}

function write(data: AppStoreData): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  // Also sync credential shortcuts for aiService.ts / transcriptionService.ts
  for (const [provider, cred] of Object.entries(data.credentials)) {
    if (cred.apiKey) {
      setCredential(provider, cred.apiKey, cred.extraConfig);
    }
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

function update(updater: (draft: AppStoreData) => AppStoreData | void): void {
  const current = read();
  const result = updater(current);
  write(result ?? current);
}

// ── Credentials ────────────────────────────────────────────────

function saveCredential(
  provider: string,
  apiKey: string,
  extra?: Record<string, string>
): void {
  update((s) => {
    s.credentials[provider] = {
      apiKey,
      keyHint: apiKey.slice(-4),
      isValid: false,
      savedAt: new Date().toISOString(),
      testedAt: null,
      testStatus: null,
      testMessage: null,
      actualStatus: "not_tested",
      errorCode: null,
      latencyMs: null,
      selectedModel: s.credentials[provider]?.selectedModel ?? null,
      extraConfig: extra ?? s.credentials[provider]?.extraConfig ?? {},
    };
  });
}

function getCredential(provider: string): string | null {
  const cred = read().credentials[provider];
  return cred?.apiKey || null;
}

function getCredentialRecord(provider: string): Credential | null {
  return read().credentials[provider] ?? null;
}

function getAllCredentials(): Record<string, Credential> {
  return read().credentials;
}

function updateCredentialTestResult(
  provider: string,
  status: "ok" | "error" | "warning",
  message: string,
  extra?: { actualStatus?: ActualStatus; errorCode?: string; latencyMs?: number }
): void {
  update((s) => {
    if (s.credentials[provider]) {
      s.credentials[provider].testedAt = new Date().toISOString();
      s.credentials[provider].testStatus = status;
      s.credentials[provider].testMessage = message;
      s.credentials[provider].isValid = status === "ok";
      s.credentials[provider].actualStatus = extra?.actualStatus ?? (status === "ok" ? "ok" : "unknown");
      s.credentials[provider].errorCode = extra?.errorCode ?? null;
      s.credentials[provider].latencyMs = extra?.latencyMs ?? null;
    }
  });
}

function updateSelectedModel(provider: string, model: string): void {
  update((s) => {
    if (s.credentials[provider]) {
      s.credentials[provider].selectedModel = model;
    }
  });
  localStorage.setItem("ai_active_model", model);
}

function deleteCredential(provider: string): void {
  update((s) => {
    delete s.credentials[provider];
    removeCredential(provider);
  });
}

// ── Integrations ───────────────────────────────────────────────

function saveIntegration(
  provider: string,
  partial: Partial<IntegrationConfig>
): void {
  update((s) => {
    const current = s.integrations[provider] ?? {
      isConnected: false,
      config: {},
      testedAt: null,
      testStatus: null,
      testMessage: null,
      syncAt: null,
    };
    s.integrations[provider] = { ...current, ...partial };
  });
}

function getIntegration(provider: string): IntegrationConfig | null {
  return read().integrations[provider] ?? null;
}

function updateIntegrationTestResult(
  provider: string,
  status: "ok" | "error" | "warning",
  message: string
): void {
  update((s) => {
    const int = s.integrations[provider];
    if (int) {
      int.testedAt = new Date().toISOString();
      int.testStatus = status;
      int.testMessage = message;
      int.isConnected = status === "ok";
    }
  });
}

// ── Users ──────────────────────────────────────────────────────

function getUsers(): UserProfile[] {
  return read().users;
}

function getUser(id: string): UserProfile | null {
  return read().users.find((u) => u.id === id) ?? null;
}

function getCurrentUser(): UserProfile | null {
  const s = read();
  return s.users.find((u) => u.id === s.currentUserId) ?? null;
}

function setCurrentUser(id: string): void {
  update((s) => {
    s.currentUserId = id;
    const user = s.users.find((u) => u.id === id);
    if (user) user.lastLoginAt = new Date().toISOString();
  });
}

function createUser(
  data: Omit<UserProfile, "id" | "createdAt" | "lastLoginAt">
): UserProfile {
  const newUser: UserProfile = {
    ...data,
    id: `u_${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  update((s) => {
    s.users.push(newUser);
  });
  return newUser;
}

function updateUser(id: string, changes: Partial<UserProfile>): void {
  update((s) => {
    const idx = s.users.findIndex((u) => u.id === id);
    if (idx !== -1) s.users[idx] = { ...s.users[idx], ...changes };
  });
}

function deleteUser(id: string): void {
  update((s) => {
    s.users = s.users.filter((u) => u.id !== id);
  });
}

function authenticate(
  email: string,
  password: string
): UserProfile | null {
  const users = read().users;
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.passwordHash === hashPassword(password) &&
      u.isActive
  );
  if (user) {
    setCurrentUser(user.id);
    return user;
  }
  return null;
}

function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): boolean {
  const user = getUser(userId);
  if (!user) return false;
  if (user.passwordHash !== hashPassword(oldPassword)) return false;
  updateUser(userId, { passwordHash: hashPassword(newPassword) });
  return true;
}

function resetPasswordAdmin(userId: string, newPassword: string): void {
  updateUser(userId, { passwordHash: hashPassword(newPassword) });
}

// ── Workspace ──────────────────────────────────────────────────

function getWorkspace(): WorkspaceSettings {
  return read().workspace;
}

function saveWorkspace(partial: Partial<WorkspaceSettings>): void {
  update((s) => {
    s.workspace = { ...s.workspace, ...partial };
  });
}

// ── AI Settings ────────────────────────────────────────────────

function getAiSettings(): AiSettings {
  return read().aiSettings;
}

function saveAiSettings(partial: Partial<AiSettings>): void {
  update((s) => {
    s.aiSettings = { ...s.aiSettings, ...partial };
    // Keep active model in sync with credentialStore shortcut
    if (partial.activeModel) {
      localStorage.setItem("ai_active_model", partial.activeModel);
    }
  });
}

// ── React hook ─────────────────────────────────────────────────
// Import { useState, useEffect } from "react" in the component

export function subscribeToStore(callback: () => void): () => void {
  window.addEventListener(STORE_EVENT, callback);
  return () => window.removeEventListener(STORE_EVENT, callback);
}

// ── Public API ─────────────────────────────────────────────────

export const AppStore = {
  // Core
  read,
  write,
  // Credentials
  saveCredential,
  getCredential,
  getCredentialRecord,
  getAllCredentials,
  updateCredentialTestResult,
  deleteCredential,
  // Integrations
  saveIntegration,
  getIntegration,
  updateIntegrationTestResult,
  // Users
  getUsers,
  getUser,
  getCurrentUser,
  setCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  authenticate,
  changePassword,
  resetPasswordAdmin,
  // Workspace
  getWorkspace,
  saveWorkspace,
  // AI Settings
  getAiSettings,
  saveAiSettings,
  updateSelectedModel,
  // Passwords (exported for use in UI)
  hashPassword,
  // Event
  STORE_EVENT,
  // Subscription
  subscribeToStore,
} as const;

export default AppStore;
