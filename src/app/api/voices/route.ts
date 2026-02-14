import { NextResponse } from "next/server";
import { voiceProfiles, suggestVoices } from "@/lib/voices";
import type { VoiceProfile } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender") as VoiceProfile["gender"] | null;
    const age = searchParams.get("age") as VoiceProfile["age"] | null;

    // Validate gender parameter if provided
    if (gender && !["male", "female", "neutral"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid 'gender' parameter. Must be one of: male, female, neutral." },
        { status: 400 }
      );
    }

    // Validate age parameter if provided
    if (age && !["young", "adult", "mature"].includes(age)) {
      return NextResponse.json(
        { error: "Invalid 'age' parameter. Must be one of: young, adult, mature." },
        { status: 400 }
      );
    }

    // If filters are provided, return suggested (filtered) voices
    if (gender || age) {
      const suggested = suggestVoices(
        gender || undefined,
        age || undefined
      );

      return NextResponse.json({
        voices: suggested,
        total: suggested.length,
        filtered: true,
      });
    }

    // No filters: return all voice profiles
    return NextResponse.json({
      voices: voiceProfiles,
      total: voiceProfiles.length,
      filtered: false,
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice profiles. Please try again." },
      { status: 500 }
    );
  }
}
