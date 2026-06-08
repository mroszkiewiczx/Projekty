// ============================================================
// src/services/transcriptionService.ts
// Real transcription via Deepgram (batch) or AssemblyAI (poll)
// ============================================================

import { getCredential } from "./credentialStore";

export class NoTranscriptionKeyError extends Error {
  constructor() {
    super(
      "Brak klucza transkrypcji. Skonfiguruj Deepgram lub AssemblyAI w Ustawienia → Klucze API"
    );
    this.name = "NoTranscriptionKeyError";
  }
}

export type TranscriptionPhase = "upload" | "transcribing";

export type ProgressCallback = (
  phase: TranscriptionPhase,
  percent: number,
  message?: string
) => void;

// ── Deepgram ──────────────────────────────────────────────────

async function transcribeDeepgram(
  file: File,
  key: string,
  onProgress: ProgressCallback
): Promise<string> {
  onProgress("upload", 30, "Wysyłanie pliku do Deepgram…");

  const params = new URLSearchParams({
    language: "pl",
    model: "nova-2",
    punctuate: "true",
    diarize: "true",
    smart_format: "true",
    utterances: "true",
  });

  onProgress("upload", 80, "Plik wysłany, trwa transkrypcja…");
  onProgress("transcribing", 10, "Deepgram analizuje audio…");

  const res = await fetch(
    `https://api.deepgram.com/v1/listen?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "Content-Type": file.type || "audio/wav",
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Deepgram ${res.status}: ${(err as Record<string,string>).err_msg || res.statusText}`
    );
  }

  onProgress("transcribing", 90, "Przetwarzanie wyników…");

  const data = await res.json();
  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

  if (!transcript) throw new Error("Deepgram nie zwrócił transkrypcji");

  onProgress("transcribing", 100, "Gotowe!");
  return transcript;
}

// ── AssemblyAI ────────────────────────────────────────────────

async function transcribeAssemblyAI(
  file: File,
  key: string,
  onProgress: ProgressCallback
): Promise<string> {
  // Step 1: Upload
  onProgress("upload", 10, "Wysyłanie pliku do AssemblyAI…");

  const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: key },
    body: file,
  });

  if (!uploadRes.ok)
    throw new Error(`AssemblyAI upload error: ${uploadRes.statusText}`);

  const { upload_url } = (await uploadRes.json()) as { upload_url: string };
  onProgress("upload", 100, "Plik wysłany!");

  // Step 2: Submit
  onProgress("transcribing", 5, "Zlecam transkrypcję…");

  const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: "pl",
      punctuate: true,
      format_text: true,
      speaker_labels: true,
    }),
  });

  if (!submitRes.ok)
    throw new Error(`AssemblyAI submit error: ${submitRes.statusText}`);

  const { id } = (await submitRes.json()) as { id: string };

  // Step 3: Poll
  let pct = 10;
  while (true) {
    await new Promise((r) => setTimeout(r, 2500));
    pct = Math.min(pct + 12, 90);

    const pollRes = await fetch(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      { headers: { authorization: key } }
    );
    const poll = (await pollRes.json()) as {
      status: string;
      text?: string;
      error?: string;
    };

    onProgress(
      "transcribing",
      pct,
      `AssemblyAI: ${poll.status === "processing" ? "przetwarzam…" : poll.status}`
    );

    if (poll.status === "completed") {
      onProgress("transcribing", 100, "Gotowe!");
      return poll.text ?? "";
    }
    if (poll.status === "error") {
      throw new Error(`AssemblyAI: ${poll.error}`);
    }
  }
}

// ── Public API ────────────────────────────────────────────────

export async function transcribeFile(
  file: File,
  onProgress: ProgressCallback = () => {}
): Promise<string> {
  const deepgramKey = getCredential("deepgram");
  const assemblyKey = getCredential("assemblyai");

  if (!deepgramKey && !assemblyKey) throw new NoTranscriptionKeyError();

  if (deepgramKey) {
    return transcribeDeepgram(file, deepgramKey, onProgress);
  }
  return transcribeAssemblyAI(file, assemblyKey!, onProgress);
}

export { hasTranscriptionKey } from "./credentialStore";
