import { NextResponse } from "next/server";
import type { ScriptAnalysis } from "@/lib/types";

// TODO: Integrate Google Gemini API for advanced script analysis
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AnalyzeScriptRequest {
  script: string;
}

/** Common English stop words to filter out of keyword extraction */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "was", "are", "be",
  "this", "that", "these", "those", "i", "you", "he", "she", "we",
  "they", "my", "your", "his", "her", "our", "their", "its", "not",
  "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "can", "have", "has", "had", "been", "being", "am", "were",
  "just", "so", "than", "too", "very", "also", "about", "up", "out",
  "if", "then", "no", "all", "each", "every", "both", "few", "more",
  "some", "any", "most", "other", "into", "over", "such", "what",
  "which", "who", "whom", "how", "when", "where", "why", "here",
  "there", "now", "get", "got", "make", "like", "think", "know",
  "take", "come", "go", "see", "look", "want", "give", "use",
]);

/**
 * Simple sentiment analysis based on keyword presence.
 * Returns one of the style-aligned sentiments for voice/music matching.
 */
function analyzeSentiment(text: string): string {
  const lower = text.toLowerCase();

  const sentimentScores: Record<string, number> = {
    excited: 0,
    educational: 0,
    calm: 0,
    professional: 0,
    friendly: 0,
  };

  const patterns: Record<string, string[]> = {
    excited: ["amazing", "incredible", "wow", "awesome", "unbelievable", "insane", "mind-blowing", "exciting", "game-changer", "love", "best"],
    educational: ["learn", "study", "research", "data", "science", "fact", "explain", "understand", "important", "key", "lesson", "tip", "strategy"],
    calm: ["relax", "peace", "mindful", "gentle", "slow", "breathe", "quiet", "serene", "meditat", "balance"],
    professional: ["business", "revenue", "growth", "market", "invest", "profit", "ROI", "performance", "metrics", "scale", "enterprise"],
    friendly: ["hey", "guys", "friend", "together", "fun", "enjoy", "share", "welcome", "join", "happy", "glad"],
  };

  for (const [sentiment, words] of Object.entries(patterns)) {
    for (const word of words) {
      if (lower.includes(word)) {
        sentimentScores[sentiment]++;
      }
    }
  }

  const topSentiment = Object.entries(sentimentScores).reduce(
    (max, [key, val]) => (val > max[1] ? [key, val] : max),
    ["friendly", 0] as [string, number]
  );

  return topSentiment[0];
}

/**
 * Extract meaningful keywords from text by filtering stop words
 * and selecting the most frequent nouns/content words.
 */
function extractKeywords(text: string, maxKeywords: number = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  // Count word frequency
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  // Sort by frequency descending and return unique keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Split script into sentences and compute natural breakpoints.
 * Estimates ~2.5 words per second for spoken pace.
 */
function computeBreakpoints(
  script: string,
  keywords: string[]
): { time: number; keyword: string; text: string }[] {
  const WORDS_PER_SECOND = 2.5;
  const sentences = script
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const breakpoints: { time: number; keyword: string; text: string }[] = [];
  let cumulativeTime = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;
    const duration = wordCount / WORDS_PER_SECOND;

    // Find the best matching keyword for this sentence
    const sentenceLower = sentence.toLowerCase();
    const matchedKeyword =
      keywords.find((kw) => sentenceLower.includes(kw)) || keywords[0] || "";

    breakpoints.push({
      time: Math.round(cumulativeTime * 10) / 10,
      keyword: matchedKeyword,
      text: sentence,
    });

    cumulativeTime += duration;
  }

  return breakpoints;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeScriptRequest;

    if (!body.script || typeof body.script !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'script' field. Expected a non-empty string." },
        { status: 400 }
      );
    }

    const script = body.script.trim();

    if (script.length === 0) {
      return NextResponse.json(
        { error: "Script cannot be empty." },
        { status: 400 }
      );
    }

    if (script.length > 10000) {
      return NextResponse.json(
        { error: "Script exceeds maximum length of 10,000 characters." },
        { status: 400 }
      );
    }

    // TODO: When GEMINI_API_KEY is available, use Gemini for richer analysis:
    // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // const prompt = `Analyze this video script and return JSON with:
    //   - keywords: array of 5-8 visual keywords for B-roll search
    //   - sentiment: one of "excited", "educational", "calm", "professional", "friendly"
    //   - breakpoints: array of { time, keyword, text } for natural scene transitions
    //   - estimatedDuration: total duration in seconds at 2.5 words/sec pace
    //   Script: """${script}"""`;
    // const result = await model.generateContent(prompt);

    const keywords = extractKeywords(script);
    const sentiment = analyzeSentiment(script);
    const breakpoints = computeBreakpoints(script, keywords);

    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = Math.round((wordCount / 2.5) * 10) / 10;

    const analysis: ScriptAnalysis = {
      keywords,
      sentiment,
      breakpoints,
      estimatedDuration,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing script:", error);
    return NextResponse.json(
      { error: "Failed to analyze script. Please try again." },
      { status: 500 }
    );
  }
}
