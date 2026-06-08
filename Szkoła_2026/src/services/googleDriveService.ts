// src/services/googleDriveService.ts
// Google Drive API v3 + Google Picker API — OAuth2 implicit flow

import { generateBatchReport, type BatchReportEntry, type BatchReportSummary } from "../lib/batchReportMarkdown";

const TOKEN_KEY = "gdrive-token";
const TOKEN_EXPIRY_KEY = "gdrive-token-expiry";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

// ── Google API Script Loader ──────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Nie udało się załadować skryptu: ${src}`));
    document.head.appendChild(script);
  });
}

// ── Inicjalizacja ─────────────────────────────────────────────────────────────

export async function initGoogleApi(apiKey: string, clientId: string): Promise<void> {
  await loadScript("https://apis.google.com/js/api.js");

  await new Promise<void>((resolve, reject) => {
    window.gapi.load("picker", { callback: resolve, onerror: reject });
  });

  // Zapisz klucze do localStorage żeby picker mógł z nich skorzystać
  localStorage.setItem("gdrive-api-key", apiKey);
  localStorage.setItem("gdrive-client-id", clientId);
}

// ── OAuth2 ────────────────────────────────────────────────────────────────────

export async function googleOAuthLogin(clientId: string): Promise<string> {
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = "https://www.googleapis.com/auth/drive";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope,
    prompt: "select_account",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return new Promise((resolve, reject) => {
    const popup = window.open(authUrl, "google-oauth", "width=520,height=620,left=200,top=100");
    if (!popup) {
      reject(new Error("Nie można otworzyć okna logowania. Zezwól na pop-upy."));
      return;
    }

    const interval = setInterval(() => {
      try {
        const url = popup.location.href;
        if (url.includes("access_token=")) {
          clearInterval(interval);
          popup.close();

          const hash = popup.location.hash || url.split("#")[1] || "";
          const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
          const token = hashParams.get("access_token");
          const expiresIn = hashParams.get("expires_in");

          if (!token) {
            reject(new Error("Brak tokenu w odpowiedzi Google"));
            return;
          }

          const expiryMs = Date.now() + (Number(expiresIn ?? 3600) * 1000);
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs));
          resolve(token);
        }
      } catch {
        // Popup jeszcze na innej domenie — czekamy
      }

      if (popup.closed) {
        clearInterval(interval);
        // Sprawdź czy token trafił do localStorage przez redirect na tę samą stronę
        const stored = getStoredToken();
        if (stored) {
          resolve(stored);
        } else {
          reject(new Error("Logowanie anulowane"));
        }
      }
    }, 300);
  });
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token) return null;
  if (expiry && Date.now() > Number(expiry)) {
    clearStoredToken();
    return null;
  }
  return token;
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// ── Google Picker ─────────────────────────────────────────────────────────────

export async function pickFolder(accessToken: string): Promise<DriveFolder | null> {
  const apiKey = localStorage.getItem("gdrive-api-key") ?? "";

  if (!window.gapi?.picker) {
    await loadScript("https://apis.google.com/js/api.js");
    await new Promise<void>((resolve, reject) => {
      window.gapi.load("picker", { callback: resolve, onerror: reject });
    });
  }

  return new Promise((resolve) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setTitle("Wybierz folder z pracami")
      .setCallback((data: GooglePickerResponse) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          if (doc) {
            resolve({ id: doc.id, name: doc.name });
          } else {
            resolve(null);
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();

    picker.setVisible(true);
  });
}

// ── Listowanie plików ─────────────────────────────────────────────────────────

export async function listFilesInFolder(
  folderId: string,
  accessToken: string
): Promise<DriveFile[]> {
  const mimeFilter = [
    "mimeType='text/plain'",
    "mimeType='application/pdf'",
    "mimeType='application/vnd.google-apps.document'",
  ].join(" or ");

  const query = `'${folderId}' in parents and (${mimeFilter}) and trashed=false`;

  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    pageSize: "100",
    orderBy: "name",
  });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Błąd listowania plików (${response.status})`);
  }

  const data = await response.json() as { files: DriveFile[] };
  return data.files ?? [];
}

// ── Pobieranie treści pliku ───────────────────────────────────────────────────

export async function getFileContent(
  fileId: string,
  mimeType: string,
  accessToken: string
): Promise<string> {
  let url: string;

  if (mimeType === "application/vnd.google-apps.document") {
    // Google Docs → eksportuj jako tekst
    url = `${DRIVE_API}/files/${fileId}/export?mimeType=text%2Fplain`;
  } else if (mimeType === "application/pdf") {
    // PDF → Drive może eksportować jako tekst (OCR)
    url = `${DRIVE_API}/files/${fileId}/export?mimeType=text%2Fplain`;
  } else {
    // text/plain i inne — pobierz bezpośrednio
    url = `${DRIVE_API}/files/${fileId}?alt=media`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    // Jeśli eksport PDF nie zadziałał — spróbuj pobrać binarnie i zwróć błąd
    if (mimeType === "application/pdf") {
      throw new Error(`Nie można odczytać PDF "${fileId}" — Drive nie obsługuje OCR dla tego pliku`);
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Błąd pobierania pliku (${response.status})`);
  }

  return response.text();
}

// ── Zapis pliku do Drive ──────────────────────────────────────────────────────

export async function saveFileToDrive(
  folderId: string,
  fileName: string,
  content: string,
  accessToken: string
): Promise<string> {
  const metadata = {
    name: fileName,
    mimeType: "text/markdown",
    parents: [folderId],
  };

  const boundary = "-----boundary_gdrive_upload";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: text/markdown; charset=UTF-8",
    "",
    content,
    `--${boundary}--`,
  ].join("\r\n");

  const response = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Błąd zapisu pliku (${response.status})`);
  }

  const data = await response.json() as { id: string };
  return data.id;
}

// ── Parsowanie linku do folderu ───────────────────────────────────────────────

export function getFolderIdFromLink(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // Czysty ID — 33 znaki alfanumeryczne (w tym podkreślniki i myślniki)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  // https://drive.google.com/drive/folders/FOLDER_ID lub z ?usp=sharing
  const foldersMatch = trimmed.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/);
  if (foldersMatch) return foldersMatch[1];

  // https://drive.google.com/open?id=FOLDER_ID
  const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];

  return null;
}

// ── Informacje o folderze ─────────────────────────────────────────────────────

export async function getFolderInfo(
  folderId: string,
  accessToken: string
): Promise<DriveFolder> {
  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=id,name`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Folder nie istnieje lub brak dostępu (${response.status})`
    );
  }

  return response.json() as Promise<DriveFolder>;
}

// ── Rekurencyjne listowanie plików ────────────────────────────────────────────

export interface DriveFileWithPath extends DriveFile {
  path: string;
  parentFolderId: string;
  parentFolderName: string;
}

const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.google-apps.document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function listFilesInFolderRaw(
  folderId: string,
  accessToken: string,
  mimeFilter: string
): Promise<DriveFile[]> {
  const query = `'${folderId}' in parents and (${mimeFilter}) and trashed=false`;
  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    pageSize: "200",
    orderBy: "name",
  });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Błąd listowania plików w folderze (${response.status})`
    );
  }

  const data = await response.json() as { files: DriveFile[] };
  return data.files ?? [];
}

async function listSubfolders(
  folderId: string,
  accessToken: string
): Promise<DriveFolder[]> {
  const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name)",
    pageSize: "200",
    orderBy: "name",
  });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Błąd listowania podfolderów (${response.status})`
    );
  }

  const data = await response.json() as { files: DriveFolder[] };
  return data.files ?? [];
}

export async function listAllFilesRecursive(
  folderId: string,
  accessToken: string
): Promise<DriveFileWithPath[]> {
  const mimeFilter = SUPPORTED_MIME_TYPES.map((m) => `mimeType='${m}'`).join(" or ");
  const result: DriveFileWithPath[] = [];

  // Pliki bezpośrednio w katalogu głównym
  const rootFiles = await listFilesInFolderRaw(folderId, accessToken, mimeFilter);
  for (const file of rootFiles) {
    result.push({
      ...file,
      path: file.name,
      parentFolderId: folderId,
      parentFolderName: "",
    });
  }

  // Podfoldery (poziom 1)
  const subfolders = await listSubfolders(folderId, accessToken);
  for (const subfolder of subfolders) {
    // Pliki w podfolderze (poziom 1)
    const level1Files = await listFilesInFolderRaw(subfolder.id, accessToken, mimeFilter);
    for (const file of level1Files) {
      result.push({
        ...file,
        path: `${subfolder.name}/${file.name}`,
        parentFolderId: subfolder.id,
        parentFolderName: subfolder.name,
      });
    }

    // Podfoldery poziomu 2 (max głębokość = 2)
    const subsubfolders = await listSubfolders(subfolder.id, accessToken);
    for (const subsubfolder of subsubfolders) {
      const level2Files = await listFilesInFolderRaw(subsubfolder.id, accessToken, mimeFilter);
      for (const file of level2Files) {
        result.push({
          ...file,
          path: `${subfolder.name}/${subsubfolder.name}/${file.name}`,
          parentFolderId: subsubfolder.id,
          parentFolderName: subsubfolder.name,
        });
      }
    }
  }

  return result;
}

// ── Tworzenie folderów ────────────────────────────────────────────────────────

export async function createFolder(
  name: string,
  parentId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Błąd tworzenia folderu "${name}" (${response.status})`
    );
  }

  const data = await response.json() as { id: string };
  return data.id;
}

export async function findOrCreateFolder(
  name: string,
  parentId: string,
  accessToken: string
): Promise<string> {
  const escapedName = name.replace(/'/g, "\\'");
  const query = `name='${escapedName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const params = new URLSearchParams({ q: query, fields: "files(id,name)", pageSize: "1" });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Błąd wyszukiwania folderu "${name}" (${response.status})`
    );
  }

  const data = await response.json() as { files: DriveFolder[] };
  if (data.files?.length > 0) {
    return data.files[0].id;
  }

  return createFolder(name, parentId, accessToken);
}

// ── Przenoszenie pliku ────────────────────────────────────────────────────────

export async function moveFile(
  fileId: string,
  newParentId: string,
  oldParentId: string,
  accessToken: string
): Promise<void> {
  const params = new URLSearchParams({
    addParents: newParentId,
    removeParents: oldParentId,
    fields: "id",
  });

  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?${params.toString()}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `Błąd przenoszenia pliku "${fileId}" (${response.status})`
    );
  }
}

// ── Upload raportu zbiorczego ─────────────────────────────────────────────────

export async function uploadBatchReport(
  folderId: string,
  folderName: string,
  entries: BatchReportEntry[],
  accessToken: string
): Promise<string> {
  const processed = entries.filter((e) => e.error === undefined).length;
  const failed = entries.filter((e) => e.error !== undefined).length;

  const batchSummary: BatchReportSummary = {
    folderName,
    processedAt: new Date().toISOString(),
    total: entries.length,
    processed,
    failed,
    entries,
  };

  const content = generateBatchReport(batchSummary);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const fileName = `RAPORT_ZBIORCZY_${datePart}.md`;

  return saveFileToDrive(folderId, fileName, content, accessToken);
}

// ── Tworzenie podfolderu z timestamp ─────────────────────────────────────────

export async function createSubfolderWithTimestamp(
  baseName: string,
  parentId: string,
  accessToken: string
): Promise<{ id: string; name: string }> {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    "-",
    pad(now.getMonth() + 1),
    "-",
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    "-",
    pad(now.getMinutes()),
  ].join("");

  const name = `${timestamp}_${baseName}`;
  const id = await createFolder(name, parentId, accessToken);
  return { id, name };
}

// ── Upload pliku Markdown ─────────────────────────────────────────────────────

export async function uploadMarkdownFile(
  folderId: string,
  fileName: string,
  content: string,
  accessToken: string
): Promise<string> {
  try {
    return await saveFileToDrive(folderId, fileName, content, accessToken);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("403")) {
      throw new Error("Brak uprawnień zapisu w folderze Drive");
    }
    throw error;
  }
}

// ── Typy globalnego gapi/google ───────────────────────────────────────────────

interface GooglePickerResponse {
  action: string;
  docs?: Array<{ id: string; name: string; mimeType: string }>;
}

interface GapiDocsView {
  setSelectFolderEnabled: (v: boolean) => GapiDocsView;
  setMimeTypes: (types: string) => GapiDocsView;
}

interface GapiPickerBuilder {
  addView: (v: GapiDocsView) => GapiPickerBuilder;
  setOAuthToken: (t: string) => GapiPickerBuilder;
  setDeveloperKey: (k: string) => GapiPickerBuilder;
  setTitle: (t: string) => GapiPickerBuilder;
  setCallback: (cb: (data: GooglePickerResponse) => void) => GapiPickerBuilder;
  build: () => { setVisible: (v: boolean) => void };
}

declare global {
  interface Window {
    gapi: {
      load: (lib: string, opts: { callback: () => void; onerror?: () => void }) => void;
      picker: unknown;
    };
    google: {
      picker: {
        DocsView: new (viewId?: unknown) => GapiDocsView;
        ViewId: { FOLDERS: unknown };
        Action: { PICKED: string; CANCEL: string };
        PickerBuilder: new () => GapiPickerBuilder;
      };
    };
  }
}
