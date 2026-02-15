import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy singleton
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    genAIInstance = new GoogleGenerativeAI(key);
  }
  return genAIInstance;
}

/** Returns a Gemini 2.0 Flash text model instance. */
export function getGeminiFlash() {
  return getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
}

/** Retry helper with exponential backoff. */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Generate speech using Gemini 2.5 Flash TTS REST API.
 * Returns base64-encoded raw PCM audio (24kHz, 16-bit, mono).
 */
export async function generateSpeech(
  text: string,
  voiceName: string,
  stylePrefix?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const spokenText = stylePrefix ? `${stylePrefix} ${text}` : text;

  return withRetry(async () => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: spokenText }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName,
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini TTS API error ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error("No audio data in Gemini TTS response");
    }

    return audioData as string;
  });
}

/**
 * Wrap raw PCM (24kHz, 16-bit LE, mono) in a WAV header for browser playback.
 * Input: base64 PCM. Output: base64 WAV.
 */
export function pcmToWav(pcmBase64: string): string {
  const pcmBytes = Buffer.from(pcmBase64, "base64");
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBytes.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const wav = Buffer.alloc(fileSize);

  // RIFF header
  wav.write("RIFF", 0);
  wav.writeUInt32LE(fileSize - 8, 4);
  wav.write("WAVE", 8);

  // fmt chunk
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16); // chunk size
  wav.writeUInt16LE(1, 20); // PCM format
  wav.writeUInt16LE(numChannels, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(byteRate, 28);
  wav.writeUInt16LE(blockAlign, 32);
  wav.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  wav.write("data", 36);
  wav.writeUInt32LE(dataSize, 40);
  pcmBytes.copy(wav, 44);

  return wav.toString("base64");
}

/**
 * Start video generation from an image using Veo 2 REST API.
 * Returns the operation name for polling.
 */
export async function generateVideoFromImage(
  prompt: string,
  imageBase64: string,
  durationSeconds: number = 8
): Promise<{ operationName: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // Determine MIME type from base64 header or default to JPEG
  let mimeType = "image/jpeg";
  if (imageBase64.startsWith("/9j/")) mimeType = "image/jpeg";
  else if (imageBase64.startsWith("iVBOR")) mimeType = "image/png";
  else if (imageBase64.startsWith("UklGR")) mimeType = "image/webp";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt,
            image: {
              bytesBase64Encoded: imageBase64,
              mimeType,
            },
          },
        ],
        parameters: {
          aspectRatio: "9:16",
          durationSeconds,
          personGeneration: "allow_all",
          sampleCount: 1,
        },
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Veo API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const operationName = data.name;
  if (!operationName) {
    throw new Error("No operation name in Veo response");
  }

  return { operationName };
}

/**
 * Check the status of a Veo video generation operation.
 */
export async function checkVideoStatus(
  operationName: string
): Promise<{ done: boolean; videoBase64?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Veo poll error ${res.status}: ${errBody}`);
  }

  const data = await res.json();

  if (data.error) {
    return { done: true, error: data.error.message || "Veo generation failed" };
  }

  if (!data.done) {
    return { done: false };
  }

  // Extract video from response
  const video =
    data.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;
  if (!video) {
    return { done: true, error: "No video data in completed Veo response" };
  }

  return { done: true, videoBase64: video };
}
